package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.JoinActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.service.ActivityServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    @Autowired
    private ActivityServiceImpl activityService;

    @PostMapping("/{activityId}/join")
    public ResponseEntity<String> joinActivity(@PathVariable Integer activityId, @RequestBody JoinActivityRequest joinActivityRequest) {
        return null;
    }
}
