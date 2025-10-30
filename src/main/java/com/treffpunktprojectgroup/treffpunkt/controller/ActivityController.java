package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.JoinActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.service.ActivityService;
import com.treffpunktprojectgroup.treffpunkt.service.ActivityServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/{activityId}/join")
    public ResponseEntity<String> joinActivity(@PathVariable Integer activityId, @RequestBody JoinActivityRequest joinActivityRequest) {
        boolean joined = activityService.joinActivity(joinActivityRequest.getUserId(), activityId);

        if(joined) {
            return ResponseEntity.ok("Katılım başarılı!");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Bu aktivite dolmuştur veya zaten katıldınız!");
        }
    }

    @DeleteMapping("/{activityId}/leave/{userId}")
    public ResponseEntity<String> leaveActivity(@PathVariable int activityId, @PathVariable int userId) {
        boolean left = activityService.leaveActivity(userId, activityId);

        if(left) {
            return ResponseEntity.ok("Aktiviteden başarıyla ayrıldınız!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Aktiviteden ayrılma işlemi başarısız oldu!");
        }
    }
}
