package com.treffpunktprojectgroup.treffpunkt.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(path = "/treffpunkt")
public class LoginHtmlController {

    @GetMapping(path = "/login")
    public String showLoginPage() {
        return "login";
    }
}
