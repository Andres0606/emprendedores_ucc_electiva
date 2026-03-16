package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.repository.EmprendimientoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emprendimientos")
@CrossOrigin("*")
public class EmprendimientoController {

    @Autowired
    private EmprendimientoRepository emprendimientoRepository;

    @PostMapping
    public Emprendimiento crear(@RequestBody Emprendimiento emprendimiento){
        return emprendimientoRepository.save(emprendimiento);
    }
}