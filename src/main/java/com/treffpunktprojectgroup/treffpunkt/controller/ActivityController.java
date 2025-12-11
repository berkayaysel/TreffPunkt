package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.ParticipantDTO;
import com.treffpunktprojectgroup.treffpunkt.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @GetMapping("")
    public ResponseEntity<List<ActivityResponse>> getFilteredActivities(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) String dateOrder
    ) {
        return ResponseEntity.ok(activityService.getFilteredActivities(category, available, dateOrder));
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

    @GetMapping("/{activityId}/participants")
    public ResponseEntity<List<ParticipantDTO>> getActivityParticipants(
            @PathVariable Integer activityId,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        List<ParticipantDTO> participants = activityService.getActivityParticipants(activityId);
        return ResponseEntity.ok(participants);
    }

    @DeleteMapping("/{activityId}/participants/{userId}")
    public ResponseEntity<String> removeParticipant(
            @PathVariable Integer activityId,
            @PathVariable Integer userId,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String creatorEmail = principal.getName();
        boolean removed = activityService.removeParticipantFromActivity(creatorEmail, activityId, userId);

        if (removed) {
            return ResponseEntity.ok("Katılımcı başarıyla çıkarıldı!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Katılımcı çıkarma işlemi başarısız oldu!");
        }
    }
}
