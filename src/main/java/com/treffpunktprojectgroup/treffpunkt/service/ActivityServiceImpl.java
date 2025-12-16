package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.ParticipantDTO;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.ActivityRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class ActivityServiceImpl implements ActivityService{

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.treffpunktprojectgroup.treffpunkt.service.NotificationService notificationService;
    
    @Autowired
    private com.treffpunktprojectgroup.treffpunkt.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.treffpunktprojectgroup.treffpunkt.repository.ReviewRepository reviewRepository;

    @Override
    public boolean joinActivity(String email, Integer activityId) {
        // Kullanıcıyı email ile buluyoruz
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Aktiviteyi getir
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();

            // Aktivite sahibi mi? Sahibi kendi aktivitesine katılamaz
            if (activity.getCreator() != null && activity.getCreator().equals(user)) {
                return false;
            }

            // Zaten katılmış mı?
            if (activity.getParticipants().contains(user)) {
                return false;
            }

            // Çıkarılmış kullanıcı mı kontrol et
            if (activity.isUserDiscarded(user)) {
                return false; // Çıkarılan kullanıcılar tekrar katılamaz
            }

            // Kapasite var mı?
            if (activity.getCapacity() > 0) {
                activity.getParticipants().add(user);
                activity.setCapacity(activity.getCapacity() - 1);
                activity.setNumberOfParticipant(activity.getNumberOfParticipant() + 1);

                activityRepository.save(activity);
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean leaveActivity(String email, Integer activityId) {

        // Kullanıcıyı email ile bul
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Aktiviteyi bul
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();

            // Kullanıcı gerçekten aktivitede mi?
            if (activity.getParticipants().contains(user)) {

                // Aktiviteden çıkar
                activity.getParticipants().remove(user);

                activity.setCapacity(activity.getCapacity() + 1);
                activity.setNumberOfParticipant(activity.getNumberOfParticipant() - 1);

                activityRepository.save(activity);

                return true;
            }
        }

        return false;
    }

    @Override
    public List<ActivityResponse> getAllActivities() {
        purgePastActivities();
        return activityRepository.findAll()
                .stream()
                .map(a -> new ActivityResponse(
                    a.getActivityId(),
                    a.getName(),
                    a.getLocation(),
                    a.getStartDate(),
                    a.getStartTime(),
                    a.getDescription(),
                    a.getNumberOfParticipant(),
                    a.getCapacity(),
                    a.getCreator() != null ? a.getCreator().getEmail() : null,
                    a.getCreator() != null ? a.getCreator().getName() : null,
                    a.getCreator() != null ? a.getCreator().getSurname() : null,
                    a.getCategory() != null ? a.getCategory().getLabel() : "Diğer",
                    a.getActivityImage()
                ))
                .toList();
    }

    @Override
    public List<ActivityResponse> getDashboardActivities(String currentUserEmail) {
        purgePastActivities();
        User currentUser = currentUserEmail != null ? userRepository.findByEmail(currentUserEmail).orElse(null) : null;
        
        return activityRepository.findAll()
                .stream()
                .filter(a -> {
                    Boolean completed = a.isCompleted();
                    // null kabul: eski kayıtlar için tamamlanmamış say
                    return completed == null || !completed;
                }) // Tamamlanan aktiviteleri gösterme
                .filter(a -> {
                    if (currentUserEmail == null) return true;
                    return a.getCreator() == null || !currentUserEmail.equals(a.getCreator().getEmail());
                })
                .map(a -> {
                    ActivityResponse ar = new ActivityResponse(
                        a.getActivityId(),
                        a.getName(),
                        a.getLocation(),
                        a.getStartDate(),
                        a.getStartTime(),
                        a.getDescription(),
                        a.getNumberOfParticipant(),
                        a.getCapacity(),
                        a.getCreator() != null ? a.getCreator().getEmail() : null,
                        a.getCreator() != null ? a.getCreator().getName() : null,
                        a.getCreator() != null ? a.getCreator().getSurname() : null,
                        a.getActivityImage()
                    );
                    ar.setCategory(a.getCategory() != null ? a.getCategory().getLabel() : null);
                    ar.setIsDiscarded(currentUser != null && a.isUserDiscarded(currentUser));
                    ar.setIsCompleted(a.isCompleted());
                    return ar;
                })
                .toList();
    }

    @Override
    public List<ActivityResponse> getFilteredActivities(String categoryLabel, Boolean available, String dateOrder, String currentUserEmail) {
        purgePastActivities();
        User currentUser = currentUserEmail != null ? userRepository.findByEmail(currentUserEmail).orElse(null) : null;
        com.treffpunktprojectgroup.treffpunkt.enums.Category cat = com.treffpunktprojectgroup.treffpunkt.enums.Category.fromLabel(categoryLabel);

        List<Activity> base;
        if (cat != null) {
            base = activityRepository.findByCategory(cat);
        } else {
            base = activityRepository.findAll();
        }

        // Tamamlanan aktiviteleri filtrele
        base = base.stream()
                .filter(a -> {
                    Boolean completed = a.isCompleted();
                    // null ise tamamlanmamış kabul et
                    return completed == null || !completed;
                })
                .toList();

        // Filter out activities created by current user
        if (currentUserEmail != null) {
            base = base.stream()
                    .filter(a -> a.getCreator() == null || !currentUserEmail.equals(a.getCreator().getEmail()))
                    .toList();
        }

        // available filter
        if (available != null && available) {
            base = base.stream().filter(a -> (a.getCapacity() != null && a.getCapacity() > 0)).toList();
        }

        // sort
        base = base.stream().sorted((x, y) -> {
            java.time.LocalDate dx = x.getStartDate();
            java.time.LocalDate dy = y.getStartDate();
            if (dx == null && dy == null) return 0;
            if (dx == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? 1 : -1;
            if (dy == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -1 : 1;
            int cmp = dx.compareTo(dy);
            if (cmp != 0) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -cmp : cmp;
            java.time.LocalTime tx = x.getStartTime();
            java.time.LocalTime ty = y.getStartTime();
            if (tx == null && ty == null) return 0;
            if (tx == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? 1 : -1;
            if (ty == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -1 : 1;
            return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -tx.compareTo(ty) : tx.compareTo(ty);
        }).toList();

        // map to DTO
        return base.stream().map(a -> {
            ActivityResponse ar = new ActivityResponse(
                a.getActivityId(),
                a.getName(),
                a.getLocation(),
                a.getStartDate(),
                a.getStartTime(),
                a.getDescription(),
                a.getNumberOfParticipant(),
                a.getCapacity(),
                a.getCreator() != null ? a.getCreator().getEmail() : null,
                a.getCreator() != null ? a.getCreator().getName() : null,
                a.getCreator() != null ? a.getCreator().getSurname() : null,
                a.getActivityImage()
            );
            ar.setCategory(a.getCategory() != null ? a.getCategory().getLabel() : null);
            ar.setIsDiscarded(currentUser != null && a.isUserDiscarded(currentUser));
            return ar;
        }).toList();
    }

    @Override
    public MyActivitiesResponse getMyActivities(String email) {

        purgePastActivities();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // KULLANICININ OLUŞTURDUĞU AKTİVİTELER
        List<Activity> createdActivities = activityRepository.findByCreator(user);

        // KULLANICININ KATILDIĞI AKTİVİTELER
        List<Activity> joinedActivities = activityRepository.findByParticipantsContains(user);

        List<ActivityResponse> createdDTO =
            createdActivities.stream()
                .map(a -> new ActivityResponse(
                    a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(),
                    a.getCreator() != null ? a.getCreator().getEmail() : null,
                    a.getCreator() != null ? a.getCreator().getName() : null,
                    a.getCreator() != null ? a.getCreator().getSurname() : null,
                    a.getCategory() != null ? a.getCategory().getLabel() : "Diğer",
                    a.getActivityImage()
                ))
                .toList();

        List<ActivityResponse> joinedDTO =
            joinedActivities.stream()
                .map(a -> new ActivityResponse(
                    a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(),
                    a.getCreator() != null ? a.getCreator().getEmail() : null,
                    a.getCreator() != null ? a.getCreator().getName() : null,
                    a.getCreator() != null ? a.getCreator().getSurname() : null,
                    a.getCategory() != null ? a.getCategory().getLabel() : "Diğer",
                    a.getActivityImage()
                ))
                .toList();

        return new MyActivitiesResponse(createdDTO, joinedDTO);
    }

    @Override
    @Transactional
    public boolean deleteActivity(String email, Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();
            System.out.println("[ActivityService] Activity found: " + activity.getName() + ", Creator: " + (activity.getCreator() != null ? activity.getCreator().getEmail() : "null"));

            if (activity.getCreator() != null && activity.getCreator().getEmail().equals(email)) {
                System.out.println("[ActivityService] Creator matches, deleting activity...");
                
                try {
                    // notify participants before deleting
                    notificationService.sendActivityDeletedNotifications(activity, activity.getCreator());
                } catch (Exception ex) {
                    System.out.println("[ActivityService] Notification send error: " + ex.getMessage());
                    // ignore notification errors
                }

                try {
                    // Delete all related data in order
                    System.out.println("[ActivityService] Deleting notifications...");
                    notificationRepository.deleteByActivityId(activityId);
                    System.out.println("[ActivityService] Notifications deleted");

                    System.out.println("[ActivityService] Deleting reviews...");
                    reviewRepository.deleteByActivityId(activityId);
                    System.out.println("[ActivityService] Reviews deleted");
                    
                    // Clear relationships
                    System.out.println("[ActivityService] Clearing relationships...");
                    // Retrieve fresh activity object to avoid detached entity issues
                    Activity freshActivity = activityRepository.findById(activityId).orElse(null);
                    if (freshActivity != null) {
                        freshActivity.getParticipants().clear();
                        freshActivity.getDiscardedUsers().clear();
                        activityRepository.save(freshActivity);
                        System.out.println("[ActivityService] Relationships cleared and saved");
                    }
                    
                    // Finally delete the activity
                    System.out.println("[ActivityService] Deleting activity...");
                    activityRepository.deleteById(activityId);
                    System.out.println("[ActivityService] Activity deleted successfully");
                    return true;
                } catch (Exception ex) {
                    System.out.println("[ActivityService] Delete error: " + ex.getMessage());
                    ex.printStackTrace();
                    return false;
                }
            } else {
                System.out.println("[ActivityService] Creator doesn't match. Activity creator: " + (activity.getCreator() != null ? activity.getCreator().getEmail() : "null") + ", User email: " + email);
            }
        } else {
            System.out.println("[ActivityService] Activity not found with ID: " + activityId);
        }

        return false;
    }

    @Override
    public List<ParticipantDTO> getActivityParticipants(Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        
        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();
            return activity.getParticipants().stream()
                    .map(user -> new ParticipantDTO(
                            user.getUserId(),
                            user.getName(),
                            user.getSurname(),
                            user.getEmail(),
                            user.getProfileImage()
                    ))
                    .toList();
        }
        
        return List.of();
    }

    @Override
    public boolean removeParticipantFromActivity(String creatorEmail, Integer activityId, Integer participantUserId, String reason) {
        // Aktiviteyi bul
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        
        if (activityOptional.isEmpty()) {
            return false;
        }
        
        Activity activity = activityOptional.get();
        
        // İsteği yapan kişinin creator olduğunu kontrol et
        if (activity.getCreator() == null || !activity.getCreator().getEmail().equals(creatorEmail)) {
            return false;
        }
        
        // Çıkarılacak kullanıcıyı bul
        Optional<User> participantOptional = userRepository.findById(participantUserId);
        
        if (participantOptional.isEmpty()) {
            return false;
        }
        
        User participant = participantOptional.get();
        
        // Kullanıcı gerçekten aktivitede mi?
        if (activity.getParticipants().contains(participant)) {
            // Aktiviteden çıkar
            activity.getParticipants().remove(participant);
            activity.setCapacity(activity.getCapacity() + 1);
            activity.setNumberOfParticipant(activity.getNumberOfParticipant() - 1);
            
            // Çıkarılan kullanıcıları discarded listesine ekle
            activity.addDiscardedUser(participant);
            
            activityRepository.save(activity);
            
            // Çıkarma sebebi ile birlikte bildirim gönder
            try {
                notificationService.sendRemovedFromActivityNotification(participant, activity, activity.getCreator(), reason);
            } catch (Exception ex) {
                // ignore
            }
            
            return true;
        }
        
        return false;
    }

    @Transactional
    protected void purgePastActivities() {
        // Pasif edildi: Geçmiş aktiviteler silinmesin ki kullanıcılar değerlendirebilsin
        // Bu metot artık veri silmiyor; sadece ileride gerekirse temizlik için düzenlenebilir.
    }

    @Override
    public String saveActivityImage(String email, Integer activityId, MultipartFile file) {

        // Aktiviteyi bul
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Aktivite bulunamadı"));

        // Güvenlik: sadece creator yükleyebilsin (istersen kaldırırsın)
        if (activity.getCreator() == null || activity.getCreator().getEmail() == null ||
                !activity.getCreator().getEmail().equals(email)) {
            throw new RuntimeException("Sadece aktivite sahibi resim ekleyebilir");
        }

        try {
            String folder = "uploads/activity-images/";
            File directory = new File(folder);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = "activity_" + activity.getActivityId() + ".png";
            Path path = Paths.get(folder + fileName);

            Files.write(path, file.getBytes());

            String publicPath = "/uploads/activity-images/" + fileName;

            activity.setActivityImage(publicPath);
            activityRepository.save(activity);

            return publicPath;

        } catch (IOException e) {
            throw new RuntimeException("Aktivite resmi kaydedilirken hata oluştu", e);
        }
    }
}
