package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.JoinActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.service.ActivityService;
import com.treffpunktprojectgroup.treffpunkt.service.ActivityServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/{activityId}/join")
    public ResponseEntity<String> joinActivity(
            @PathVariable Integer activityId,
            Principal principal   // kullanıcıyı buradan alıyoruz
    ) {
        String email = principal.getName();

        boolean joined = activityService.joinActivity(email, activityId);

        if (joined) {
            return ResponseEntity.ok("Katılım başarılı!");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Bu aktivite dolmuştur veya zaten katıldınız!");
        }
    }

    @DeleteMapping("/{activityId}/leave")
    public ResponseEntity<String> leaveActivity(
            @PathVariable int activityId,
            Principal principal
    ) {
        String email = principal.getName();

        boolean left = activityService.leaveActivity(email, activityId);

        if (left) {
            return ResponseEntity.ok("Aktiviteden başarıyla ayrıldınız!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Aktiviteden ayrılma işlemi başarısız oldu!");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<ActivityResponse>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @GetMapping("/my-activities")
    public ResponseEntity<MyActivitiesResponse> getMyActivities(Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        MyActivitiesResponse response = activityService.getMyActivities(email);

        return ResponseEntity.ok(response);
    }
}
