"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "el";

type Strings = Record<string, string | string[]>;

/**
 * Greek typography rule: uppercase Greek doesn't carry tonal marks.
 * Strings rendered with text-transform:uppercase (nav, eyebrows, buttons,
 * info labels) are written WITHOUT accents. Body text stays accented.
 */
const STRINGS: Record<Lang, Strings> = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.gallery": "Gallery",
    "nav.team": "Our Team",
    "nav.contact": "Contact",
    "nav.book": "Book a chair",
    "nav.shop": "Shop",
    "cta.book": "Book a chair →",
    "cta.see": "See services",
    "cta.full_menu": "Full menu →",
    "minutes": "min",
    "today": "Open today",
    "address": "Address",
    "phone": "Phone",
    "hours": "Hours",
    "email": "Email",
    "shop": "Shop",
    "visit": "Visit",
    "sharp_since": "Sharp since 2018.",
    "hero.pill": "Loutraki, Greece",
    "hero.title": "Sharp cuts.",
    "hero.title_accent": "Quiet luxury.",
    "hero.subtitle":
      "Old-school craft, modern detail. From classic scissor work to skin fades and hot-towel shaves — book the chair, leave a different man.",
    "hero.meta1": "★★★★★ 4.9 / 412 reviews",
    "hero.meta2": "Open today · 09:00–21:00",
    "hero.role": "Master barber",
    "info.open": "Open today",
    "info.open_value": "09:00 – 21:00",
    "info.address": "Address",
    "info.address_value": "Eleftheriou Venizelou 12, Loutraki",
    "info.phone": "Phone",
    "info.phone_value": "+30 27440 00000",
    "info.walk_ins": "Walk-ins",
    "info.walk_ins_value": "When chairs are open",
    "services.eyebrow": "The menu",
    "services.title": "Cuts, beards, the works.",
    "gallery.eyebrow": "Inside the shop",
    "gallery.title": "Where good cuts happen.",
    "testimonials.eyebrow": "From the chair",
    "testimonials.title": "What our regulars say.",
    "cta.eyebrow": "Take a seat",
    "cta.title": "The next chair has your name on it.",
    "cta.subtitle":
      "Book in under a minute. Choose your service, your barber, and the time that works.",

    // Sub-page headers
    "page.services.eyebrow": "The menu",
    "page.services.title": "Cuts, beards, and the full ritual.",
    "page.services.sub":
      "Honest pricing, real time slots. Add a beard or hot shave to any cut at the chair.",
    "page.gallery.eyebrow": "Gallery",
    "page.gallery.title": "Inside the shop. On the chair.",
    "page.gallery.sub":
      "A look at the room, the team, and the work that walks out the door.",
    "page.team.eyebrow": "Our team",
    "page.team.title": "Three barbers. One standard.",
    "page.team.sub":
      "The chairs at Spade are run by three barbers who care about the work and the people in front of them.",
    "page.contact.eyebrow": "Contact",
    "page.contact.title": "Find us in Loutraki.",
    "page.contact.sub":
      "Two blocks from the seafront. Free parking on the side street, espresso bar across the road.",
    "page.book.eyebrow": "Booking",
    "page.book.title": "Pick a chair, pick a time.",
    "page.book.sub":
      "Takes about a minute. You'll get an email confirmation and a reminder 8 hours before your appointment.",
    "page.shop.eyebrow": "Shop",
    "page.shop.title": "Tools, oils, and the small luxuries.",
    "page.shop.sub":
      "Everything we use on the chair, available to take home.",
    "page.cart.eyebrow": "Cart",
    "page.cart.title": "Almost yours.",
    "page.cart.sub":
      "Review your items, leave your details, we'll confirm by phone.",

    // Filters
    "filter.all": "All",
    "filter.cuts": "Cuts",
    "filter.beards": "Beards",
    "filter.shop": "Shop",

    // FAQ
    "faq.eyebrow": "Questions",
    "faq.title": "Good to know.",
    "faq.q1": "Do I need an appointment?",
    "faq.a1":
      "We recommend booking online — chairs fill up fast. Walk-ins are welcome whenever a chair is free.",
    "faq.q2": "What's your cancellation policy?",
    "faq.a2":
      "Free cancellation up to 4 hours before your slot. After that we ask for 50% of the service price.",
    "faq.q3": "Do you take card?",
    "faq.a3":
      "Card, cash, Apple Pay, Google Pay — all good. Tips appreciated, never expected.",
    "faq.q4": "Can I bring my kid?",
    "faq.a4":
      "Of course. We have a dedicated kids cut and our team is patient with young clients.",
    "faq.q5": "Where exactly are you?",
    "faq.a5":
      "Eleftheriou Venizelou 12, Loutraki, two blocks from the seafront. Free parking on the side street.",

    // About / story
    "about.eyebrow": "Our story",
    "about.title": "A barber shop, the way it should be.",
    "about.p1":
      "Spade opened in Loutraki in 2018 with one chair, one barber, and a stubborn idea: take the time, do the work properly, and the people will come back.",
    "about.p2":
      "Eight years later we've added two more chairs and a small team — but the philosophy hasn't budged. No production line. No rushing. Just sharp work in a quiet, well-lit room with good music and proper coffee.",
    "about.p3":
      "We work on classic cuts, modern fades, full beard sculpting, and the kind of hot-towel shave you book the day before. Walk-ins welcome when chairs are open.",

    // Team grid
    "team.eyebrow": "The team",
    "team.title": "Three chairs. Three stories.",
    "team.years": "In the chair",
    "team.book_with": "Book with",
    "team.role.master": "Master Barber · Founder",
    "team.role.senior": "Senior Barber",
    "team.role.barber": "Barber",
    "team.years.12": "12 years",
    "team.years.8": "8 years",
    "team.years.4": "4 years",

    // Testimonials
    "tt1.q":
      "Best skin fade in Loutraki, easily. Andreas takes his time and the finish is razor sharp.",
    "tt1.r": "Regular since 2021",
    "tt2.q":
      "Hot towel shave was a religious experience. Walked out a different man.",
    "tt2.r": "Visitor from Athens",
    "tt3.q":
      "Booking online is dead simple. Show up, sit down, leave looking sharp.",
    "tt3.r": "Regular since 2019",

    // Contact
    "contact.address.label": "Address",
    "contact.address.value": "Eleftheriou Venizelou 12\nLoutraki 20300, Greece",
    "contact.phone.label": "Phone",
    "contact.phone.value": "+30 27440 00000",
    "contact.email.label": "Email",
    "contact.email.value": "hello@spade.gr",
    "contact.hours.label": "Hours",
    "contact.hours.value": "Mon–Sat · 09:00–21:00\nSunday · Closed",

    // Footer
    "footer.lede":
      "Classic cuts, modern fades, and the kind of hot-towel shave you book the day before. Walk-ins welcome when chairs are open.",
    "footer.cta": "Take a seat.",
    "footer.shop": "Shop",
    "footer.visit": "Visit",
    "footer.contact": "Contact",
    "footer.copy": "© {year} Spade Barber Shop · Loutraki, GR",

    // Booking flow
    "book.step.service": "Pick a service",
    "book.step.barber": "Pick your barber",
    "book.step.time": "Pick a day & time",
    "book.step.details": "Your details",
    "book.step.confirm": "Confirm",
    "book.steps.label": "Step",
    "book.btn.review": "Review →",
    "book.btn.confirm": "Confirm booking",
    "book.btn.confirming": "Booking…",
    "book.btn.back": "Back",
    "book.fld.name": "Full name",
    "book.fld.phone": "Phone",
    "book.fld.email": "Email",
    "book.fld.notes": "Notes (optional)",
    "book.notes.ph": "Anything we should know.",
    "book.success.title": "See you soon.",
    "book.success.line": "Booking confirmed for {date} at {time} with {barber}.",
    "book.success.ref": "Reference",
    "book.success.email_sent": "A confirmation email is on its way — check your inbox (and spam folder).",
    "book.success.back": "Back to home",
    "book.sum.service": "Service",
    "book.sum.duration": "Duration",
    "book.sum.barber": "Barber",
    "book.sum.date": "Date",
    "book.sum.time": "Time",
    "book.sum.notes": "Notes",
    "book.error.network": "Network error. Try again.",
    "book.scroll": "scroll",

    // Service catalog (names + desc)
    "svc.mens.name": "Men's Haircut",
    "svc.mens.desc":
      "Classic men's cut, finished with hot towel and styling.",
    "svc.kids.name": "Kids Haircut",
    "svc.kids.desc": "Patient, careful work for our youngest clients.",
    "svc.beard.name": "Beard",
    "svc.beard.desc":
      "Beard shaped and lined up with the straight razor.",
    "svc.skin.name": "Skin Refresh (scrub)",
    "svc.skin.desc": "Gentle face scrub that wakes the skin up.",
    "svc.mask.name": "Face Cleanse · Black Mask",
    "svc.mask.desc": "Deep cleansing with the black peel-off mask.",
    "svc.cutbeard.name": "Haircut + Beard",
    "svc.cutbeard.desc":
      "Full haircut paired with beard sculpt and razor line-up.",
    "svc.full.name": "Full Grooming",
    "svc.full.desc":
      "Haircut, beard and ear/nose wax. The complete session.",
    "svc.cutbeardmask.name": "Haircut + Beard + Black Mask",
    "svc.cutbeardmask.desc":
      "Haircut, beard sculpt, and a deep-cleansing black mask.",
    "svc.book": "Book →",
  },
  el: {
    // ---- UPPERCASE strings (no τόνοι) ----
    "nav.home": "Αρχικη",
    "nav.services": "Υπηρεσιες",
    "nav.gallery": "Γκαλερι",
    "nav.team": "Ομαδα",
    "nav.contact": "Επαφη",
    "nav.book": "Ραντεβου",
    "nav.shop": "Shop",
    "cta.book": "Κλεισε ραντεβου →",
    "cta.see": "Δες τις υπηρεσιες",
    "cta.full_menu": "Ολες οι υπηρεσιες →",
    "minutes": "λεπτα",
    "today": "Σημερα ανοιχτα",
    "address": "Διευθυνση",
    "phone": "Τηλεφωνο",
    "hours": "Ωραριο",
    "email": "Email",
    "shop": "Καταστημα",
    "visit": "Που θα μας βρεις",
    "info.open": "Σημερα ανοιχτα",
    "info.address": "Διευθυνση",
    "info.phone": "Τηλεφωνο",
    "info.walk_ins": "Χωρις ραντεβου",
    "services.eyebrow": "Οι υπηρεσιες μας",
    "gallery.eyebrow": "Μεσα στο μαγαζι",
    "testimonials.eyebrow": "Απο την καρεκλα",
    "cta.eyebrow": "Παρε θεση",
    "hero.pill": "Λουτρακι, Ελλαδα",
    "hero.role": "Master barber",

    // ---- BODY strings (keep τόνοι) ----
    "sharp_since": "Κοφτεροί από το 2018.",
    "hero.title": "Κοφτερά κουρέματα.",
    "hero.title_accent": "Ήσυχη πολυτέλεια.",
    "hero.subtitle":
      "Κλασική τέχνη, σύγχρονη πινελιά. Από κούρεμα με ψαλίδι μέχρι skin fade και ξύρισμα με ζεστή πετσέτα — κάθεσαι στην καρέκλα, σηκώνεσαι αλλιώτικος.",
    "hero.meta1": "★★★★★ 4.9 / 412 κριτικές",
    "hero.meta2": "Σήμερα ανοιχτά · 09:00–21:00",
    "info.open_value": "09:00 – 21:00",
    "info.address_value": "Ελευθερίου Βενιζέλου 12, Λουτράκι",
    "info.phone_value": "+30 27440 00000",
    "info.walk_ins_value": "Όποτε υπάρχει ελεύθερη καρέκλα",
    "services.title": "Κουρέματα, γένια, και όλα τα ενδιάμεσα.",
    "gallery.title": "Εδώ γίνονται τα ωραία κουρέματα.",
    "testimonials.title": "Τι λένε όσοι κάθονται στην καρέκλα μας.",
    "cta.title": "Η επόμενη καρέκλα γράφει τ’ όνομά σου.",
    "cta.subtitle":
      "Κλείνεις σε ένα λεπτό. Διαλέγεις υπηρεσία, κουρέα και ώρα — εμείς αναλαμβάνουμε τα υπόλοιπα.",

    // Sub-page headers (eyebrows uppercase no τόνοι, titles & subs τόνοι)
    "page.services.eyebrow": "Οι υπηρεσιες",
    "page.services.title": "Κουρέματα, γένια, και η πλήρης διαδικασία.",
    "page.services.sub":
      "Καθαρές τιμές, αληθινά διαθέσιμα ραντεβού. Πρόσθεσε γένια ή ξύρισμα στο κούρεμα όταν κάθεσαι στην καρέκλα.",
    "page.gallery.eyebrow": "Φωτογραφιες",
    "page.gallery.title": "Μέσα στο μαγαζί. Πάνω στην καρέκλα.",
    "page.gallery.sub":
      "Μια ματιά στον χώρο, στην ομάδα, και στα κουρέματα που βγαίνουν από την πόρτα.",
    "page.team.eyebrow": "Η ομαδα μας",
    "page.team.title": "Τρεις κουρείς. Ένα στάνταρ.",
    "page.team.sub":
      "Στις τρεις καρέκλες του Spade δουλεύουν τρεις κουρείς που νοιάζονται για τη δουλειά και για όποιον κάθεται μπροστά τους.",
    "page.contact.eyebrow": "Επικοινωνια",
    "page.contact.title": "Θα μας βρεις στο Λουτράκι.",
    "page.contact.sub":
      "Δύο τετράγωνα από την παραλία. Δωρεάν πάρκινγκ στον κάθετο δρόμο, καφές απέναντι.",
    "page.book.eyebrow": "Κρατηση",
    "page.book.title": "Διάλεξε καρέκλα, διάλεξε ώρα.",
    "page.book.sub":
      "Σου παίρνει ένα λεπτό. Θα λάβεις επιβεβαίωση στο email και υπενθύμιση 8 ώρες πριν το ραντεβού σου.",
    "page.shop.eyebrow": "Καταστημα",
    "page.shop.title": "Εργαλεία, λάδια και μικρές πολυτέλειες.",
    "page.shop.sub":
      "Ό,τι χρησιμοποιούμε στην καρέκλα, διαθέσιμο να το πάρεις σπίτι.",
    "page.cart.eyebrow": "Καλαθι",
    "page.cart.title": "Σχεδόν δικά σου.",
    "page.cart.sub":
      "Έλεγξε τα προϊόντα, άφησε τα στοιχεία σου και θα επιβεβαιώσουμε τηλεφωνικά.",

    // Filters
    "filter.all": "Ολα",
    "filter.cuts": "Κουρεματα",
    "filter.beards": "Γενια",
    "filter.shop": "Μαγαζι",

    // FAQ
    "faq.eyebrow": "Συχνες ερωτησεις",
    "faq.title": "Καλό να ξέρεις.",
    "faq.q1": "Χρειάζομαι ραντεβού;",
    "faq.a1":
      "Σου προτείνουμε να κλείσεις online — οι καρέκλες γεμίζουν γρήγορα. Walk-in δεκτό όποτε υπάρχει ελεύθερη θέση.",
    "faq.q2": "Μπορώ να ακυρώσω;",
    "faq.a2":
      "Δωρεάν ακύρωση μέχρι 4 ώρες πριν το ραντεβού. Μετά χρεώνουμε το 50% της υπηρεσίας.",
    "faq.q3": "Δέχεστε κάρτα;",
    "faq.a3":
      "Κάρτα, μετρητά, Apple Pay, Google Pay — όλα παίζουν. Το φιλοδώρημα εκτιμάται, ποτέ δεν περιμένεται.",
    "faq.q4": "Μπορώ να φέρω το παιδί μου;",
    "faq.a4":
      "Φυσικά. Έχουμε ξεχωριστό κούρεμα για παιδιά και η ομάδα είναι υπομονετική με τους μικρούς πελάτες.",
    "faq.q5": "Πού ακριβώς είστε;",
    "faq.a5":
      "Ελευθερίου Βενιζέλου 12, Λουτράκι, δύο τετράγωνα από την παραλία. Δωρεάν πάρκινγκ στον κάθετο δρόμο.",

    // About / story
    "about.eyebrow": "Η ιστορια μας",
    "about.title": "Ένα κουρείο, όπως πρέπει να είναι.",
    "about.p1":
      "Το Spade άνοιξε στο Λουτράκι το 2018 με μία καρέκλα, έναν κουρέα και μία πεισματάρικη ιδέα: άφησε το χρόνο να κάνει τη δουλειά σωστά, και ο κόσμος θα ξαναέρθει.",
    "about.p2":
      "Οκτώ χρόνια μετά έχουμε προσθέσει δύο ακόμα καρέκλες και μια μικρή ομάδα — η φιλοσοφία όμως δεν άλλαξε. Καμία γραμμή παραγωγής. Καμία βιασύνη. Μόνο καθαρή δουλειά σ’ ένα ήσυχο, καλά φωτισμένο μαγαζί με σωστή μουσική και καλό καφέ.",
    "about.p3":
      "Δουλεύουμε κλασικά κουρέματα, μοντέρνα fades, ολόκληρα γένια, και το ξύρισμα με ζεστή πετσέτα που θες να κλείσεις από την προηγούμενη. Walk-in δεκτό όταν υπάρχει ελεύθερη καρέκλα.",

    // Team
    "team.eyebrow": "Η ομαδα",
    "team.title": "Τρεις καρέκλες. Τρεις ιστορίες.",
    "team.years": "Στην καρέκλα",
    "team.book_with": "Κλεισε με τον",
    "team.role.master": "Master Barber · Ιδρυτής",
    "team.role.senior": "Senior Barber",
    "team.role.barber": "Barber",
    "team.years.12": "12 χρόνια",
    "team.years.8": "8 χρόνια",
    "team.years.4": "4 χρόνια",

    // Testimonials
    "tt1.q":
      "Το καλύτερο skin fade στο Λουτράκι, χωρίς αντίρρηση. Ο Ανδρέας παίρνει το χρόνο του και η λεπτομέρεια είναι κοφτερή.",
    "tt1.r": "Σταθερός πελάτης από το 2021",
    "tt2.q":
      "Το ξύρισμα με ζεστή πετσέτα ήταν εμπειρία ζωής. Βγήκα άλλος άνθρωπος.",
    "tt2.r": "Επισκέπτης από Αθήνα",
    "tt3.q":
      "Η online κράτηση είναι παιχνιδάκι. Έρχεσαι, κάθεσαι, φεύγεις κοφτερός.",
    "tt3.r": "Σταθερός πελάτης από το 2019",

    // Contact
    "contact.address.label": "Διευθυνση",
    "contact.address.value":
      "Ελευθερίου Βενιζέλου 12\nΛουτράκι 20300, Ελλάδα",
    "contact.phone.label": "Τηλεφωνο",
    "contact.phone.value": "+30 27440 00000",
    "contact.email.label": "Email",
    "contact.email.value": "hello@spade.gr",
    "contact.hours.label": "Ωραριο",
    "contact.hours.value": "Δευ–Σαβ · 09:00–21:00\nΚυριακή · Κλειστά",

    // Footer
    "footer.lede":
      "Κλασικά κουρέματα, μοντέρνα fades, και το ξύρισμα με ζεστή πετσέτα που θες να κλείσεις από την προηγούμενη. Walk-in δεκτό όταν υπάρχει ελεύθερη καρέκλα.",
    "footer.cta": "Πάρε θέση.",
    "footer.shop": "Καταστημα",
    "footer.visit": "Που θα μας βρεις",
    "footer.contact": "Επικοινωνια",
    "footer.copy": "© {year} Spade Barber Shop · Λουτράκι, GR",

    // Booking flow
    "book.step.service": "Διάλεξε υπηρεσία",
    "book.step.barber": "Διάλεξε κουρέα",
    "book.step.time": "Διάλεξε μέρα & ώρα",
    "book.step.details": "Τα στοιχεία σου",
    "book.step.confirm": "Επιβεβαίωση",
    "book.steps.label": "Βήμα",
    "book.btn.review": "Έλεγχος →",
    "book.btn.confirm": "Επιβεβαίωση κράτησης",
    "book.btn.confirming": "Καταχώρηση…",
    "book.btn.back": "Πίσω",
    "book.fld.name": "Ονοματεπώνυμο",
    "book.fld.phone": "Τηλέφωνο",
    "book.fld.email": "Email",
    "book.fld.notes": "Σημειώσεις (προαιρετικό)",
    "book.notes.ph": "Πες μας οτιδήποτε χρήσιμο.",
    "book.success.title": "Τα λέμε σύντομα.",
    "book.success.line":
      "Η κράτηση καταχωρήθηκε για {date} στις {time} με τον/την {barber}.",
    "book.success.ref": "Κωδικός",
    "book.success.email_sent": "Ένα email επιβεβαίωσης είναι στον δρόμο — δες τα εισερχόμενα (και τα ανεπιθύμητα).",
    "book.success.back": "Επιστροφή στην αρχική",
    "book.sum.service": "Υπηρεσία",
    "book.sum.duration": "Διάρκεια",
    "book.sum.barber": "Κουρέας",
    "book.sum.date": "Ημερομηνία",
    "book.sum.time": "Ώρα",
    "book.sum.notes": "Σημειώσεις",
    "book.error.network": "Σφάλμα δικτύου. Ξαναπροσπάθησε.",
    "book.scroll": "scroll",

    // Service catalog
    "svc.mens.name": "Κούρεμα ανδρικό",
    "svc.mens.desc":
      "Κλασικό αντρικό κούρεμα, τελείωμα με ζεστή πετσέτα και styling.",
    "svc.kids.name": "Κούρεμα παιδικό",
    "svc.kids.desc":
      "Υπομονετική, προσεκτική δουλειά για τους μικρούς μας πελάτες.",
    "svc.beard.name": "Μούσι",
    "svc.beard.desc": "Σχηματισμός και γραμμή στο μούσι με ξυράφι.",
    "svc.skin.name": "Skin Refresh (scrub)",
    "svc.skin.desc": "Απαλό scrub που ξυπνάει την επιδερμίδα.",
    "svc.mask.name": "Καθαρισμός προσώπου · black mask",
    "svc.mask.desc":
      "Σε βάθος καθαρισμός με τη μαύρη μάσκα peel-off.",
    "svc.cutbeard.name": "Κούρεμα + μούσι",
    "svc.cutbeard.desc":
      "Πλήρες κούρεμα μαζί με σχηματισμό μουσιού και γραμμή με ξυράφι.",
    "svc.full.name": "Full Grooming",
    "svc.full.desc":
      "Κούρεμα, μούσι και wax (αυτιά / μύτη). Η πλήρης περιποίηση.",
    "svc.cutbeardmask.name": "Κούρεμα + μούσι + black mask",
    "svc.cutbeardmask.desc":
      "Κούρεμα, σχηματισμός μουσιού και καθαρισμός με τη μαύρη μάσκα.",
    "svc.book": "Κλεισε →",
  },
};

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  pick: (en: string, el?: string) => string;
};

const Ctx = createContext<LangCtx | null>(null);

function readCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )spade_lang=(en|el)/);
  return (m?.[1] as Lang) ?? null;
}

function writeCookie(l: Lang) {
  document.cookie = `spade_lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const fromCookie = readCookie();
    if (fromCookie) {
      setLangState(fromCookie);
      return;
    }
    const browser = navigator.language?.toLowerCase() ?? "";
    if (browser.startsWith("el")) setLangState("el");
  }, []);

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l);
        writeCookie(l);
      },
      t: (key) => {
        const v = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
        return Array.isArray(v) ? v.join("") : v;
      },
      pick: (en, el) => (lang === "el" && el ? el : en),
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const c = useContext(Ctx);
  if (!c) {
    return {
      lang: "en",
      setLang: () => {},
      t: (k) => (STRINGS.en[k] as string) ?? k,
      pick: (en) => en,
    };
  }
  return c;
}
