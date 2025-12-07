package com.treffpunktprojectgroup.treffpunkt.enums;

public enum Category {
    SPORTS_FITNESS("Sports & Fitness"),
    SOCIAL_FUN("Social & Fun"),
    ARTS_CULTURE("Arts & Culture"),
    GASTRONOMY_COOKING("Gastronomy & Cooking"),
    NATURE_ADVENTURE("Nature & Adventure"),
    ARTS_CRAFTS_DDIY("Arts, Crafts & DIY"),
    TECHNOLOGY_INNOVATION("Technology & Innovation"),
    VOLUNTEERING_COMMUNITY("Volunteering & Community"),
    WELLNESS_SPIRITUALITY("Wellness & Spirituality"),
    GAMING_COMPETITION("Gaming & Competition"),
    MUSIC_PERFORMANCE("Music & Performance"),
    FAMILY_KIDS("Family & Kids"),
    SHOPPING_SUSTAINABILITY("Shopping & Sustainability"),
    DIGER("Diğer");

    private final String label;

    Category(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static Category fromLabel(String label) {
        if (label == null) return null;
        for (Category c : values()) {
            if (c.label.equalsIgnoreCase(label.trim())) return c;
        }
        // try to match by normalized name
        String normalized = label.trim().toUpperCase().replaceAll("[\s&,-]+","_");
        try {
            return Category.valueOf(normalized);
        } catch (Exception e) {
            return DIGER;
        }
    }
}
