package com.example.slotbook.controller;


// FileController.java
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
// import org.springframework.web.server.ResponseStatusException;

import com.example.slotbook.entity.FileEntity;
import com.example.slotbook.repository.FileRepository;
// import com.example.slotbook.dto.FileResponse;

// import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    @Autowired
    private FileRepository fileRepository;

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) throws Exception {
        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(file.getOriginalFilename());
        fileEntity.setFileType(file.getContentType());
        fileEntity.setData(file.getBytes());
        fileRepository.save(fileEntity);
        return "File uploaded successfully: " + file.getOriginalFilename();
    }

    // @GetMapping("/files")
    // public List<FileEntity> getFiles() {
    //     List<FileEntity> files = fileRepository.findAll();
    //     // Clear binary data before sending response
    //     files.forEach(file -> file.setData(null));
    //     return files;
    // }

    // @GetMapping("/files/{id}")
    // public ResponseEntity<byte[]> getFile(@PathVariable Long id) {
    //     FileEntity file = fileRepository.findById(id)
    //         .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    //     return ResponseEntity.ok()
    //         .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
    //         .contentType(MediaType.parseMediaType(file.getFileType()))
    //         .body(file.getData());
    // }
}

