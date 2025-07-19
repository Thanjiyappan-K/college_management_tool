from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import pandas as pd
import fitz  # PyMuPDF - better for text extraction
import pytesseract
from pdf2image import convert_from_path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import MiniBatchKMeans
import re
import json
import uuid
from datetime import datetime
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
from werkzeug.utils import secure_filename
import sqlite3
from contextlib import contextmanager
import time
import hashlib
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import numpy as np
from collections import defaultdict

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Database setup
DATABASE = 'plagiarism_detection.db'

def init_db():
    """Initialize the database with required tables"""
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        
        # Table for storing batch processing results
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS batch_results (
                id TEXT PRIMARY KEY,
                batch_name TEXT,
                subject TEXT,
                exam_date TEXT,
                total_papers INTEGER,
                processed_papers INTEGER,
                suspicious_count INTEGER,
                status TEXT,
                created_at TIMESTAMP,
                completed_at TIMESTAMP,
                results_file TEXT,
                similarity_threshold REAL DEFAULT 0.85
            )
        ''')
        
        # Table for storing individual paper results
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS paper_results (
                id TEXT PRIMARY KEY,
                batch_id TEXT,
                filename TEXT,
                student_name TEXT,
                student_id TEXT,
                registration_number TEXT,
                extracted_text TEXT,
                text_hash TEXT,
                word_count INTEGER,
                created_at TIMESTAMP,
                FOREIGN KEY (batch_id) REFERENCES batch_results (id)
            )
        ''')
        
        # Table for storing similarity results
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS similarity_results (
                id TEXT PRIMARY KEY,
                batch_id TEXT,
                paper1_id TEXT,
                paper2_id TEXT,
                similarity_score REAL,
                similarity_type TEXT,
                matched_segments TEXT,
                is_suspicious BOOLEAN,
                created_at TIMESTAMP,
                FOREIGN KEY (batch_id) REFERENCES batch_results (id),
                FOREIGN KEY (paper1_id) REFERENCES paper_results (id),
                FOREIGN KEY (paper2_id) REFERENCES paper_results (id)
            )
        ''')
        
        # Table for storing n-gram analysis
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ngram_analysis (
                id TEXT PRIMARY KEY,
                batch_id TEXT,
                paper1_id TEXT,
                paper2_id TEXT,
                common_ngrams INTEGER,
                total_ngrams INTEGER,
                jaccard_similarity REAL,
                created_at TIMESTAMP,
                FOREIGN KEY (batch_id) REFERENCES batch_results (id)
            )
        ''')
        
        conn.commit()

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

class EnhancedPlagiarismDetector:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=6)
        self.similarity_threshold = 0.85
        self.ngram_size = 10
        self.stop_words = set(stopwords.words('english'))
        
    def allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def extract_student_info_from_filename(self, filename):
        """Extract student information from filename pattern: 21CS001_JP_Kumar.pdf"""
        # Remove extension
        name_part = os.path.splitext(filename)[0]
        
        # Common patterns for student files
        patterns = [
            r'(\d{2}[A-Z]{2}\d{3})_([A-Z]+)_([A-Za-z]+)',  # 21CS001_JP_Kumar
            r'(\d{6,8})_([A-Za-z\s]+)',  # 21001234_John_Doe
            r'([A-Z]{2}\d{6})_([A-Za-z\s]+)',  # CS210001_Jane_Smith
            r'(\d{2}[A-Z]{1,3}\d{3})_([A-Za-z\s_]+)',  # 21CS001_John_Doe
        ]
        
        for pattern in patterns:
            match = re.search(pattern, name_part, re.IGNORECASE)
            if match:
                if len(match.groups()) >= 2:
                    reg_number = match.group(1).upper()
                    name_parts = match.group(2).replace('_', ' ').strip()
                    
                    # If there's a third group, combine second and third
                    if len(match.groups()) >= 3:
                        name_parts += ' ' + match.group(3).replace('_', ' ').strip()
                    
                    return {
                        'registration_number': reg_number,
                        'student_name': name_parts.title(),
                        'student_id': reg_number  # Use registration number as ID
                    }
        
        # Fallback: try to extract any alphanumeric pattern
        fallback_match = re.search(r'([A-Z0-9]{6,12})', name_part.upper())
        if fallback_match:
            return {
                'registration_number': fallback_match.group(1),
                'student_name': 'Unknown',
                'student_id': fallback_match.group(1)
            }
        
        return {
            'registration_number': 'UNKNOWN',
            'student_name': 'Unknown',
            'student_id': 'UNKNOWN'
        }
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF using PyMuPDF with OCR fallback"""
        try:
            # First try direct text extraction
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(min(len(doc), 10)):  # Process first 10 pages
                page = doc[page_num]
                page_text = page.get_text()
                
                # If no text found, try OCR
                if not page_text.strip():
                    try:
                        pix = page.get_pixmap()
                        img_data = pix.tobytes("ppm")
                        
                        # Convert to PIL Image and run OCR
                        from PIL import Image
                        import io
                        img = Image.open(io.BytesIO(img_data))
                        page_text = pytesseract.image_to_string(img)
                    except Exception as e:
                        logger.warning(f"OCR failed for page {page_num}: {e}")
                        page_text = ""
                
                text += page_text + " "
            
            doc.close()
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {e}")
            return ""
    
    def preprocess_text(self, text):
        """Clean and preprocess text for comparison"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and numbers, keep only letters and spaces
        text = re.sub(r'[^a-z\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Tokenize and remove stopwords
        tokens = word_tokenize(text)
        tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def generate_ngrams(self, text, n=10):
        """Generate n-grams from text"""
        words = text.split()
        if len(words) < n:
            return [' '.join(words)]
        
        ngrams = []
        for i in range(len(words) - n + 1):
            ngram = ' '.join(words[i:i + n])
            ngrams.append(ngram)
        
        return ngrams
    
    def calculate_jaccard_similarity(self, set1, set2):
        """Calculate Jaccard similarity between two sets"""
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def generate_text_hash(self, text):
        """Generate hash for text content"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def process_single_pdf(self, pdf_path, batch_id):
        """Process a single PDF file"""
        filename = os.path.basename(pdf_path)
        
        try:
            # Extract student info from filename
            student_info = self.extract_student_info_from_filename(filename)
            
            # Extract text from PDF
            raw_text = self.extract_text_from_pdf(pdf_path)
            
            # Preprocess text
            processed_text = self.preprocess_text(raw_text)
            
            # Generate text hash
            text_hash = self.generate_text_hash(processed_text)
            
            # Count words
            word_count = len(processed_text.split())
            
            # Store in database
            paper_id = str(uuid.uuid4())
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO paper_results 
                    (id, batch_id, filename, student_name, student_id, registration_number, 
                     extracted_text, text_hash, word_count, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (paper_id, batch_id, filename, student_info['student_name'], 
                      student_info['student_id'], student_info['registration_number'],
                      processed_text[:10000], text_hash, word_count, datetime.now()))
                conn.commit()
            
            return {
                'id': paper_id,
                'filename': filename,
                'student_info': student_info,
                'processed_text': processed_text,
                'word_count': word_count,
                'text_hash': text_hash
            }
            
        except Exception as e:
            logger.error(f"Error processing {filename}: {str(e)}")
            return None
    
    def detect_plagiarism_advanced(self, batch_id, processed_papers):
        """Advanced plagiarism detection using multiple techniques"""
        if len(processed_papers) < 2:
            return []
        
        suspicious_pairs = []
        
        # Filter out papers with insufficient content
        valid_papers = [p for p in processed_papers if p and p['word_count'] > 50]
        
        if len(valid_papers) < 2:
            return []
        
        # 1. Exact hash matching (fastest)
        hash_groups = defaultdict(list)
        for paper in valid_papers:
            hash_groups[paper['text_hash']].append(paper)
        
        # Find exact duplicates
        for hash_key, papers in hash_groups.items():
            if len(papers) > 1:
                for i in range(len(papers)):
                    for j in range(i + 1, len(papers)):
                        suspicious_pairs.append({
                            'paper1': papers[i],
                            'paper2': papers[j],
                            'similarity': 1.0,
                            'type': 'exact_duplicate'
                        })
        
        # 2. TF-IDF + Cosine Similarity
        texts = [paper['processed_text'] for paper in valid_papers]
        
        try:
            vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 3))
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            # Use clustering to optimize comparisons
            n_clusters = min(10, len(valid_papers) // 3 + 1)
            kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42)
            clusters = kmeans.fit_predict(tfidf_matrix)
            
            # Compare within clusters
            for cluster in range(n_clusters):
                cluster_indices = [i for i, c in enumerate(clusters) if c == cluster]
                if len(cluster_indices) < 2:
                    continue
                
                cluster_matrix = tfidf_matrix[cluster_indices]
                similarity_matrix = cosine_similarity(cluster_matrix)
                
                for i in range(len(cluster_indices)):
                    for j in range(i + 1, len(cluster_indices)):
                        similarity = similarity_matrix[i][j]
                        if similarity >= self.similarity_threshold:
                            idx_i = cluster_indices[i]
                            idx_j = cluster_indices[j]
                            
                            # Check if not already found as exact duplicate
                            pair_exists = any(
                                (p['paper1']['id'] == valid_papers[idx_i]['id'] and 
                                 p['paper2']['id'] == valid_papers[idx_j]['id']) or
                                (p['paper1']['id'] == valid_papers[idx_j]['id'] and 
                                 p['paper2']['id'] == valid_papers[idx_i]['id'])
                                for p in suspicious_pairs
                            )
                            
                            if not pair_exists:
                                suspicious_pairs.append({
                                    'paper1': valid_papers[idx_i],
                                    'paper2': valid_papers[idx_j],
                                    'similarity': similarity,
                                    'type': 'high_similarity'
                                })
        
        except Exception as e:
            logger.error(f"TF-IDF analysis failed: {e}")
        
        # 3. N-gram Analysis for remaining pairs
        for pair in suspicious_pairs:
            if pair['type'] == 'high_similarity':
                try:
                    ngrams1 = set(self.generate_ngrams(pair['paper1']['processed_text'], self.ngram_size))
                    ngrams2 = set(self.generate_ngrams(pair['paper2']['processed_text'], self.ngram_size))
                    
                    jaccard_sim = self.calculate_jaccard_similarity(ngrams1, ngrams2)
                    
                    # Store n-gram analysis
                    with get_db() as conn:
                        cursor = conn.cursor()
                        cursor.execute('''
                            INSERT INTO ngram_analysis 
                            (id, batch_id, paper1_id, paper2_id, common_ngrams, total_ngrams, 
                             jaccard_similarity, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (str(uuid.uuid4()), batch_id, pair['paper1']['id'], 
                              pair['paper2']['id'], len(ngrams1.intersection(ngrams2)),
                              len(ngrams1.union(ngrams2)), jaccard_sim, datetime.now()))
                        conn.commit()
                
                except Exception as e:
                    logger.error(f"N-gram analysis failed: {e}")
        
        # Store similarity results in database
        with get_db() as conn:
            cursor = conn.cursor()
            
            for pair in suspicious_pairs:
                sim_id = str(uuid.uuid4())
                cursor.execute('''
                    INSERT INTO similarity_results 
                    (id, batch_id, paper1_id, paper2_id, similarity_score, similarity_type, 
                     is_suspicious, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (sim_id, batch_id, pair['paper1']['id'], pair['paper2']['id'],
                      pair['similarity'], pair['type'], True, datetime.now()))
            
            conn.commit()
        
        return suspicious_pairs

# Initialize database and detector
init_db()
detector = EnhancedPlagiarismDetector()

@app.route('/', methods=['GET'])
def index():
    """API status endpoint"""
    return jsonify({
        'status': 'active',
        'service': 'Enhanced Answer Script Plagiarism Detection API',
        'version': '2.0.0',
        'capabilities': [
            'PDF text extraction with OCR fallback',
            'Student info extraction from filenames',
            'Multi-technique plagiarism detection',
            'N-gram analysis',
            'Batch processing optimization',
            'Detailed similarity reporting'
        ],
        'endpoints': {
            'upload': '/upload',
            'status': '/status/<batch_id>',
            'results': '/results/<batch_id>',
            'suspicious': '/suspicious/<batch_id>',
            'detailed': '/detailed/<batch_id>',
            'batches': '/batches',
            'download': '/download/<batch_id>'
        }
    })

@app.route('/upload', methods=['POST'])
def upload_answer_scripts():
    """Upload and process answer script PDFs"""
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    batch_name = request.form.get('batch_name', f'Batch_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
    subject = request.form.get('subject', 'Unknown Subject')
    exam_date = request.form.get('exam_date', datetime.now().strftime("%Y-%m-%d"))
    similarity_threshold = float(request.form.get('similarity_threshold', 0.85))
    
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No files selected'}), 400
    
    # Validate files
    valid_files = []
    for file in files:
        if file and detector.allowed_file(file.filename):
            valid_files.append(file)
    
    if not valid_files:
        return jsonify({'error': 'No valid PDF files provided'}), 400
    
    if len(valid_files) < 2:
        return jsonify({'error': 'At least 2 PDFs required for comparison'}), 400
    
    # Create batch record
    batch_id = str(uuid.uuid4())
    detector.similarity_threshold = similarity_threshold
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO batch_results 
            (id, batch_name, subject, exam_date, total_papers, processed_papers, 
             suspicious_count, status, created_at, similarity_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (batch_id, batch_name, subject, exam_date, len(valid_files), 
              0, 0, 'processing', datetime.now(), similarity_threshold))
        conn.commit()
    
    # Save files and process
    batch_folder = os.path.join(app.config['UPLOAD_FOLDER'], batch_id)
    os.makedirs(batch_folder, exist_ok=True)
    
    try:
        # Save all files first
        saved_files = []
        for file in valid_files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(batch_folder, filename)
            file.save(filepath)
            saved_files.append(filepath)
        
        # Process PDFs in parallel
        processed_papers = []
        
        with ThreadPoolExecutor(max_workers=6) as executor:
            future_to_file = {
                executor.submit(detector.process_single_pdf, filepath, batch_id): filepath 
                for filepath in saved_files
            }
            
            for future in as_completed(future_to_file):
                filepath = future_to_file[future]
                try:
                    result = future.result()
                    if result:
                        processed_papers.append(result)
                    
                    # Update progress
                    with get_db() as conn:
                        cursor = conn.cursor()
                        cursor.execute('''
                            UPDATE batch_results 
                            SET processed_papers = processed_papers + 1
                            WHERE id = ?
                        ''', (batch_id,))
                        conn.commit()
                        
                except Exception as e:
                    logger.error(f"Error processing {filepath}: {e}")
        
        # Detect plagiarism
        suspicious_pairs = detector.detect_plagiarism_advanced(batch_id, processed_papers)
        
        # Generate results file
        results_file = generate_detailed_results_file(batch_id)
        
        # Update batch status
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE batch_results 
                SET status = ?, completed_at = ?, suspicious_count = ?, results_file = ?
                WHERE id = ?
            ''', ('completed', datetime.now(), len(suspicious_pairs), results_file, batch_id))
            conn.commit()
        
        return jsonify({
            'batch_id': batch_id,
            'batch_name': batch_name,
            'subject': subject,
            'exam_date': exam_date,
            'total_papers': len(valid_files),
            'processed_papers': len(processed_papers),
            'suspicious_count': len(suspicious_pairs),
            'similarity_threshold': similarity_threshold,
            'status': 'completed',
            'results_file': results_file
        })
        
    except Exception as e:
        # Update batch status to failed
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE batch_results 
                SET status = ?, completed_at = ?
                WHERE id = ?
            ''', ('failed', datetime.now(), batch_id))
            conn.commit()
        
        logger.error(f"Error processing batch {batch_id}: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/status/<batch_id>', methods=['GET'])
def get_batch_status(batch_id):
    """Get batch processing status"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM batch_results WHERE id = ?
        ''', (batch_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'error': 'Batch not found'}), 404
        
        return jsonify({
            'batch_id': result['id'],
            'batch_name': result['batch_name'],
            'subject': result['subject'],
            'exam_date': result['exam_date'],
            'total_papers': result['total_papers'],
            'processed_papers': result['processed_papers'],
            'suspicious_count': result['suspicious_count'],
            'similarity_threshold': result['similarity_threshold'],
            'status': result['status'],
            'created_at': result['created_at'],
            'completed_at': result['completed_at'],
            'results_file': result['results_file']
        })

@app.route('/suspicious/<batch_id>', methods=['GET'])
def get_suspicious_cases(batch_id):
    """Get all suspicious cases for a batch"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                sr.similarity_score,
                sr.similarity_type,
                p1.filename as paper1_filename,
                p1.student_name as paper1_student,
                p1.student_id as paper1_id,
                p1.registration_number as paper1_reg,
                p2.filename as paper2_filename,
                p2.student_name as paper2_student,
                p2.student_id as paper2_id,
                p2.registration_number as paper2_reg,
                sr.created_at
            FROM similarity_results sr
            JOIN paper_results p1 ON sr.paper1_id = p1.id
            JOIN paper_results p2 ON sr.paper2_id = p2.id
            WHERE sr.batch_id = ? AND sr.is_suspicious = TRUE
            ORDER BY sr.similarity_score DESC
        ''', (batch_id,))
        
        results = cursor.fetchall()
        
        if not results:
            return jsonify({'error': 'No suspicious cases found'}), 404
        
        suspicious_cases = []
        for result in results:
            suspicious_cases.append({
                'similarity_score': round(result['similarity_score'], 4),
                'similarity_type': result['similarity_type'],
                'student1': {
                    'filename': result['paper1_filename'],
                    'name': result['paper1_student'],
                    'student_id': result['paper1_id'],
                    'registration_number': result['paper1_reg']
                },
                'student2': {
                    'filename': result['paper2_filename'],
                    'name': result['paper2_student'],
                    'student_id': result['paper2_id'],
                    'registration_number': result['paper2_reg']
                },
                'detected_at': result['created_at']
            })
        
        return jsonify({
            'batch_id': batch_id,
            'total_suspicious_cases': len(suspicious_cases),
            'suspicious_cases': suspicious_cases
        })

@app.route('/detailed/<batch_id>', methods=['GET'])
def get_detailed_analysis(batch_id):
    """Get detailed analysis including n-gram results"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get similarity results with n-gram analysis
        cursor.execute('''
            SELECT 
                sr.similarity_score,
                sr.similarity_type,
                p1.filename as paper1_filename,
                p1.student_name as paper1_student,
                p1.registration_number as paper1_reg,
                p1.word_count as paper1_words,
                p2.filename as paper2_filename,
                p2.student_name as paper2_student,
                p2.registration_number as paper2_reg,
                p2.word_count as paper2_words,
                ng.common_ngrams,
                ng.total_ngrams,
                ng.jaccard_similarity
            FROM similarity_results sr
            JOIN paper_results p1 ON sr.paper1_id = p1.id
            JOIN paper_results p2 ON sr.paper2_id = p2.id
            LEFT JOIN ngram_analysis ng ON sr.paper1_id = ng.paper1_id AND sr.paper2_id = ng.paper2_id
            WHERE sr.batch_id = ? AND sr.is_suspicious = TRUE
            ORDER BY sr.similarity_score DESC
        ''', (batch_id,))
        
        results = cursor.fetchall()
        
        detailed_analysis = []
        for result in results:
            detailed_analysis.append({
                'similarity_score': round(result['similarity_score'], 4),
                'similarity_type': result['similarity_type'],
                'jaccard_similarity': round(result['jaccard_similarity'] or 0, 4),
                'common_ngrams': result['common_ngrams'] or 0,
                'total_ngrams': result['total_ngrams'] or 0,
                'student1': {
                    'filename': result['paper1_filename'],
                    'name': result['paper1_student'],
                    'registration_number': result['paper1_reg'],
                    'word_count': result['paper1_words']
                },
                'student2': {
                    'filename': result['paper2_filename'],
                    'name': result['paper2_student'],
                    'registration_number': result['paper2_reg'],
                    'word_count': result['paper2_words']
                }
            })
        
        return jsonify({
            'batch_id': batch_id,
            'detailed_analysis': detailed_analysis
        })

@app.route('/batches', methods=['GET'])
def get_all_batches():
    """Get all batch processing history"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM batch_results 
            ORDER BY created_at DESC
        ''')
        batches = cursor.fetchall()
        
        batch_list = []
        for batch in batches:
            batch_list.append({
                'batch_id': batch['id'],
                'batch_name': batch['batch_name'],
                'subject': batch['subject'],
                'exam_date': batch['exam_date'],
                'total_papers': batch['total_papers'],
                'processed_papers': batch['processed_papers'],
                'suspicious_count': batch['suspicious_count'],
                'similarity_threshold': batch['similarity_threshold'],
                'status': batch['status'],
                'created_at': batch['created_at'],
                'completed_at': batch['completed_at']
            })
        
        return jsonify({
            'total_batches': len(batch_list),
            'batches': batch_list
        })

@app.route('/download/<batch_id>', methods=['GET'])
def download_results(batch_id):
    """Download results as CSV file"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT batch_name, results_file FROM batch_results WHERE id = ?
        ''', (batch_id,))
        result = cursor.fetchone()
        
        if not result or not result['results_file']:
            return jsonify({'error': 'Results file not found'}), 404
        
        results_path = os.path.join(app.config['RESULTS_FOLDER'], result['results_file'])
        
        if not os.path.exists(results_path):
            return jsonify({'error': 'Results file not found on disk'}), 404
        
        return send_file(
            results_path,
            as_attachment=True,
            download_name=f"{result['batch_name']}_results.csv",
            mimetype='text/csv'
        )

def generate_detailed_results_file(batch_id):
    """Generate detailed results CSV file for a batch"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get batch info
        cursor.execute('SELECT batch_name FROM batch_results WHERE id = ?', (batch_id,))
        batch_info = cursor.fetchone()
        
        if not batch_info:
            return None
        
        # Get all paper results
        cursor.execute('''
            SELECT 
                p.filename,
                p.student_name,
                p.student_id,
                p.registration_number,
                p.word_count,
                p.text_hash
            FROM paper_results p
            WHERE p.batch_id = ?
            ORDER BY p.filename
        ''', (batch_id,))
        
        papers = cursor.fetchall()
        
        # Get similarity results
        cursor.execute('''
            SELECT 
                sr.similarity_score,
                sr.similarity_type,
                p1.filename as paper1_filename,
                p1.student_name as paper1_student,
                p1.registration_number as paper1_reg,
                p2.filename as paper2_filename,
                p2.student_name as paper2_student,
                p2.registration_number as paper2_reg,
                ng.jaccard_similarity,
                ng.common_ngrams,
                ng.total_ngrams
            FROM similarity_results sr
            JOIN paper_results p1 ON sr.paper1_id = p1.id
            JOIN paper_results p2 ON sr.paper2_id = p2.id
            LEFT JOIN ngram_analysis ng ON sr.paper1_id = ng.paper1_id AND sr.paper2_id = ng.paper2_id
            WHERE sr.batch_id = ? AND sr.is_suspicious = TRUE
            ORDER BY sr.similarity_score DESC
        ''', (batch_id,))
        
        similarities = cursor.fetchall()
    
    # Create results DataFrame
    results_data = []
    
    # Add summary information
    results_data.append({
        'Type': 'BATCH_SUMMARY',
        'Batch Name': batch_info['batch_name'],
        'Total Papers': len(papers),
        'Suspicious Cases': len(similarities),
        'Analysis Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    # Add empty row for separation
    results_data.append({})
    
    # Add paper information
    results_data.append({
        'Type': 'PAPER_INFO',
        'Filename': 'FILENAME',
        'Student Name': 'STUDENT_NAME',
        'Registration Number': 'REGISTRATION_NUMBER',
        'Word Count': 'WORD_COUNT',
        'Text Hash': 'TEXT_HASH'
    })
    
    for paper in papers:
        results_data.append({
            'Type': 'PAPER',
            'Filename': paper['filename'],
            'Student Name': paper['student_name'],
            'Registration Number': paper['registration_number'],
            'Word Count': paper['word_count'],
            'Text Hash': paper['text_hash'][:16] + '...'  # Truncate hash for readability
        })
    
    # Add empty row for separation
    results_data.append({})
    
    # Add similarity results header
    results_data.append({
        'Type': 'SIMILARITY_RESULTS',
        'Paper 1': 'PAPER_1',
        'Student 1': 'STUDENT_1',
        'Paper 2': 'PAPER_2',
        'Student 2': 'STUDENT_2',
        'Cosine Similarity': 'COSINE_SIMILARITY',
        'Jaccard Similarity': 'JACCARD_SIMILARITY',
        'Common N-grams': 'COMMON_NGRAMS',
        'Total N-grams': 'TOTAL_NGRAMS',
        'Similarity Type': 'SIMILARITY_TYPE'
    })
    
    for sim in similarities:
        results_data.append({
            'Type': 'SIMILARITY',
            'Paper 1': sim['paper1_filename'],
            'Student 1': f"{sim['paper1_student']} ({sim['paper1_reg']})",
            'Paper 2': sim['paper2_filename'],
            'Student 2': f"{sim['paper2_student']} ({sim['paper2_reg']})",
            'Cosine Similarity': round(sim['similarity_score'], 4),
            'Jaccard Similarity': round(sim['jaccard_similarity'] or 0, 4),
            'Common N-grams': sim['common_ngrams'] or 0,
            'Total N-grams': sim['total_ngrams'] or 0,
            'Similarity Type': sim['similarity_type']
        })
    
    # Create DataFrame and save to CSV
    df = pd.DataFrame(results_data)
    
    # Generate filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"plagiarism_results_{batch_id}_{timestamp}.csv"
    filepath = os.path.join(app.config['RESULTS_FOLDER'], filename)
    
    # Save to CSV
    df.to_csv(filepath, index=False)
    
    return filename

@app.route('/delete/<batch_id>', methods=['DELETE'])
def delete_batch(batch_id):
    """Delete a batch and all associated data"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if batch exists
            cursor.execute('SELECT results_file FROM batch_results WHERE id = ?', (batch_id,))
            result = cursor.fetchone()
            
            if not result:
                return jsonify({'error': 'Batch not found'}), 404
            
            # Delete from database tables
            cursor.execute('DELETE FROM ngram_analysis WHERE batch_id = ?', (batch_id,))
            cursor.execute('DELETE FROM similarity_results WHERE batch_id = ?', (batch_id,))
            cursor.execute('DELETE FROM paper_results WHERE batch_id = ?', (batch_id,))
            cursor.execute('DELETE FROM batch_results WHERE id = ?', (batch_id,))
            
            conn.commit()
            
            # Delete uploaded files
            batch_folder = os.path.join(app.config['UPLOAD_FOLDER'], batch_id)
            if os.path.exists(batch_folder):
                shutil.rmtree(batch_folder)
            
            # Delete results file
            if result['results_file']:
                results_path = os.path.join(app.config['RESULTS_FOLDER'], result['results_file'])
                if os.path.exists(results_path):
                    os.remove(results_path)
            
            return jsonify({'message': 'Batch deleted successfully'})
            
    except Exception as e:
        logger.error(f"Error deleting batch {batch_id}: {str(e)}")
        return jsonify({'error': f'Failed to delete batch: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM batch_results')
            count = cursor.fetchone()[0]
        
        # Test directories
        upload_exists = os.path.exists(app.config['UPLOAD_FOLDER'])
        results_exists = os.path.exists(app.config['RESULTS_FOLDER'])
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'total_batches': count,
            'upload_folder': 'exists' if upload_exists else 'missing',
            'results_folder': 'exists' if results_exists else 'missing',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(413)
def file_too_large(e):
    """Handle file size exceeded error"""
    return jsonify({'error': 'File too large. Maximum size is 50MB'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {str(e)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Ensure required directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(RESULTS_FOLDER, exist_ok=True)
    
    # Initialize database
    init_db()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)