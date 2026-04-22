export type IndustryPreset = {
  id: string;
  label: string;
  wordmark: string;
  tagline_en: string;
  tagline_el: string;
  hero: {
    pill_en: string;
    pill_el: string;
    title_en: string;
    title_el: string;
    titleAccent_en: string;
    titleAccent_el: string;
    subtitle_en: string;
    subtitle_el: string;
  };
  services: Array<{
    name_en: string;
    name_el: string;
    price: number;
    duration: number;
    desc_en: string;
    desc_el: string;
  }>;
  bookCta_en: string;
  bookCta_el: string;
};

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: "barber",
    label: "Barber / Grooming",
    wordmark: "BARBER",
    tagline_en: "Classic grooming",
    tagline_el: "Κλασική περιποίηση",
    hero: {
      pill_en: "Open today",
      pill_el: "Ανοιχτά σήμερα",
      title_en: "Sharp cuts.",
      title_el: "Ακριβές ψαλίδι.",
      titleAccent_en: "Clean finish.",
      titleAccent_el: "Καθαρό φινίρισμα.",
      subtitle_en:
        "Classic cuts, fades, and hot-towel shaves. Walk in or book online in under a minute.",
      subtitle_el:
        "Κλασικά κουρέματα, fades και ξυρίσματα με ζεστή πετσέτα. Περάστε ή κλείστε online σε ένα λεπτό.",
    },
    services: [
      { name_en: "Men's Haircut", name_el: "Κούρεμα Ανδρικό", price: 12, duration: 30, desc_en: "Classic men's cut with hot towel finish.", desc_el: "Κλασικό κούρεμα με ζεστή πετσέτα." },
      { name_en: "Kids Haircut", name_el: "Κούρεμα Παιδικό", price: 10, duration: 25, desc_en: "Careful, patient work for kids.", desc_el: "Προσεκτικό κούρεμα για παιδιά." },
      { name_en: "Beard Trim", name_el: "Μούσι", price: 5, duration: 15, desc_en: "Shaped and razor-lined.", desc_el: "Σχηματισμένο με ξυράφι." },
      { name_en: "Cut + Beard", name_el: "Κούρεμα + Μούσι", price: 15, duration: 45, desc_en: "Haircut plus beard sculpt.", desc_el: "Κούρεμα με περιποίηση γενειάδας." },
    ],
    bookCta_en: "Book a chair",
    bookCta_el: "Κλείσε καρέκλα",
  },
  {
    id: "salon",
    label: "Hair salon",
    wordmark: "SALON",
    tagline_en: "Hair & color",
    tagline_el: "Κομμωτήριο",
    hero: {
      pill_en: "Open today",
      pill_el: "Ανοιχτά σήμερα",
      title_en: "Your best",
      title_el: "Το καλύτερο",
      titleAccent_en: "hair day.",
      titleAccent_el: "στα μαλλιά.",
      subtitle_en:
        "Cuts, color, balayage, styling. Book with the stylist you love, online.",
      subtitle_el:
        "Κουρέματα, βαφές, balayage, styling. Κλείστε online με τον κομμωτή της επιλογής σας.",
    },
    services: [
      { name_en: "Cut & Style", name_el: "Κούρεμα & Styling", price: 35, duration: 60, desc_en: "Wash, cut, and blow-dry.", desc_el: "Λούσιμο, κούρεμα και πιστολάκι." },
      { name_en: "Root Color", name_el: "Βαφή Ριζών", price: 45, duration: 75, desc_en: "Touch-up color on roots.", desc_el: "Ανανέωση χρώματος στις ρίζες." },
      { name_en: "Balayage", name_el: "Balayage", price: 120, duration: 180, desc_en: "Hand-painted highlights.", desc_el: "Highlights βαμμένα στο χέρι." },
      { name_en: "Blow-dry", name_el: "Χτένισμα", price: 20, duration: 30, desc_en: "Clean blow-out and finish.", desc_el: "Καθαρό χτένισμα και φινίρισμα." },
    ],
    bookCta_en: "Book a stylist",
    bookCta_el: "Κλείσε ραντεβού",
  },
  {
    id: "spa",
    label: "Spa / Beauty",
    wordmark: "SPA",
    tagline_en: "Rest · reset",
    tagline_el: "Ηρεμία · Ανανέωση",
    hero: {
      pill_en: "Reservations open",
      pill_el: "Κρατήσεις ανοιχτές",
      title_en: "Slow down.",
      title_el: "Ηρέμησε.",
      titleAccent_en: "Breathe.",
      titleAccent_el: "Ανάπνευσε.",
      subtitle_en:
        "Facials, massages, and body treatments by trained therapists. Book your session online.",
      subtitle_el:
        "Περιποιήσεις προσώπου, μασάζ και θεραπείες σώματος από εκπαιδευμένους θεραπευτές. Κλείστε online.",
    },
    services: [
      { name_en: "Signature Facial", name_el: "Περιποίηση Προσώπου", price: 55, duration: 60, desc_en: "Cleanse, exfoliate, hydrate.", desc_el: "Καθαρισμός, απολέπιση, ενυδάτωση." },
      { name_en: "Deep Tissue Massage", name_el: "Θεραπευτικό Μασάζ", price: 65, duration: 60, desc_en: "Targets tight, sore muscles.", desc_el: "Στοχεύει σε μύες με ένταση." },
      { name_en: "Body Scrub", name_el: "Body Scrub", price: 45, duration: 45, desc_en: "Full-body exfoliation.", desc_el: "Απολέπιση όλου του σώματος." },
      { name_en: "Relax Package", name_el: "Πακέτο Χαλάρωσης", price: 110, duration: 120, desc_en: "Facial + massage combo.", desc_el: "Περιποίηση + μασάζ." },
    ],
    bookCta_en: "Book a session",
    bookCta_el: "Κλείσε ραντεβού",
  },
  {
    id: "gym",
    label: "Gym / Fitness",
    wordmark: "GYM",
    tagline_en: "Train hard",
    tagline_el: "Προπόνηση",
    hero: {
      pill_en: "Free trial week",
      pill_el: "Δωρεάν δοκιμαστική",
      title_en: "Stronger",
      title_el: "Πιο δυνατός",
      titleAccent_en: "every week.",
      titleAccent_el: "κάθε βδομάδα.",
      subtitle_en:
        "Personal training, group classes, and a clean, no-nonsense gym floor.",
      subtitle_el:
        "Προσωπική προπόνηση, ομαδικά μαθήματα και καθαρός, λειτουργικός χώρος.",
    },
    services: [
      { name_en: "Monthly Pass", name_el: "Μηνιαία Συνδρομή", price: 50, duration: 0, desc_en: "Full gym access, 30 days.", desc_el: "Πλήρης πρόσβαση, 30 ημέρες." },
      { name_en: "Personal Training", name_el: "Personal Training", price: 35, duration: 60, desc_en: "One-on-one coached session.", desc_el: "Εξατομικευμένη προπόνηση." },
      { name_en: "Group Class", name_el: "Ομαδικό Μάθημα", price: 12, duration: 50, desc_en: "HIIT, strength, or mobility.", desc_el: "HIIT, δύναμη ή ευλυγισία." },
      { name_en: "Day Pass", name_el: "Ημερήσια Είσοδος", price: 10, duration: 0, desc_en: "Single-day gym access.", desc_el: "Είσοδος μιας ημέρας." },
    ],
    bookCta_en: "Start training",
    bookCta_el: "Ξεκίνα προπόνηση",
  },
  {
    id: "clinic",
    label: "Clinic / Dentist / Doctor",
    wordmark: "CLINIC",
    tagline_en: "Care that listens",
    tagline_el: "Φροντίδα που ακούει",
    hero: {
      pill_en: "Accepting new patients",
      pill_el: "Δεχόμαστε νέους ασθενείς",
      title_en: "Your health,",
      title_el: "Η υγεία σου,",
      titleAccent_en: "looked after.",
      titleAccent_el: "σε καλά χέρια.",
      subtitle_en:
        "Evidence-based care from experienced practitioners. Book online and skip the phone queue.",
      subtitle_el:
        "Αξιόπιστη φροντίδα από έμπειρους επαγγελματίες. Κλείστε online και αποφύγετε την αναμονή.",
    },
    services: [
      { name_en: "Consultation", name_el: "Ιατρική Επίσκεψη", price: 50, duration: 30, desc_en: "Initial assessment.", desc_el: "Αρχική εκτίμηση." },
      { name_en: "Follow-up", name_el: "Επανεξέταση", price: 30, duration: 20, desc_en: "Check-in for existing patients.", desc_el: "Έλεγχος για γνωστούς ασθενείς." },
      { name_en: "Cleaning / Scaling", name_el: "Καθαρισμός Δοντιών", price: 60, duration: 45, desc_en: "Standard dental cleaning.", desc_el: "Τυπικός καθαρισμός δοντιών." },
      { name_en: "Annual Check", name_el: "Ετήσιος Έλεγχος", price: 80, duration: 45, desc_en: "Comprehensive yearly review.", desc_el: "Πλήρης ετήσιος έλεγχος." },
    ],
    bookCta_en: "Book an appointment",
    bookCta_el: "Κλείσε ραντεβού",
  },
  {
    id: "tutor",
    label: "Tutor / Coach",
    wordmark: "TUTOR",
    tagline_en: "Teach · grow",
    tagline_el: "Μάθηση · εξέλιξη",
    hero: {
      pill_en: "Booking lessons",
      pill_el: "Κρατήσεις μαθημάτων",
      title_en: "Clear path",
      title_el: "Ξεκάθαρος δρόμος",
      titleAccent_en: "to the goal.",
      titleAccent_el: "στον στόχο.",
      subtitle_en:
        "One-on-one tutoring and coaching tailored to each student. Book a trial lesson.",
      subtitle_el:
        "Εξατομικευμένα ιδιαίτερα μαθήματα και coaching. Κλείσε δοκιμαστικό μάθημα.",
    },
    services: [
      { name_en: "Trial Lesson", name_el: "Δοκιμαστικό Μάθημα", price: 0, duration: 30, desc_en: "Free intro session.", desc_el: "Δωρεάν γνωριμία." },
      { name_en: "Single Lesson", name_el: "Ένα Μάθημα", price: 30, duration: 60, desc_en: "One-hour session.", desc_el: "Μάθημα μίας ώρας." },
      { name_en: "4-Lesson Pack", name_el: "Πακέτο 4 Μαθημάτων", price: 110, duration: 0, desc_en: "Save £10 on a pack.", desc_el: "Κερδίζεις £10 στο πακέτο." },
      { name_en: "Exam Prep", name_el: "Προετοιμασία Εξετάσεων", price: 250, duration: 0, desc_en: "10-hour intensive.", desc_el: "10 ώρες εντατικά." },
    ],
    bookCta_en: "Book a lesson",
    bookCta_el: "Κλείσε μάθημα",
  },
  {
    id: "consultant",
    label: "Consultant / Pro service",
    wordmark: "STUDIO",
    tagline_en: "Expert help",
    tagline_el: "Ειδική βοήθεια",
    hero: {
      pill_en: "Now booking",
      pill_el: "Διαθέσιμα ραντεβού",
      title_en: "Work with",
      title_el: "Συνεργασία",
      titleAccent_en: "an expert.",
      titleAccent_el: "με ειδικό.",
      subtitle_en:
        "Strategy, advice, and done-for-you work. Book a discovery call to see if we fit.",
      subtitle_el:
        "Στρατηγική, συμβουλές, υλοποίηση. Κλείστε ραντεβού γνωριμίας.",
    },
    services: [
      { name_en: "Discovery Call", name_el: "Ραντεβού Γνωριμίας", price: 0, duration: 30, desc_en: "Free 30-min call.", desc_el: "Δωρεάν κλήση 30'." },
      { name_en: "Strategy Session", name_el: "Στρατηγική Συνάντηση", price: 150, duration: 60, desc_en: "Deep-dive on your goal.", desc_el: "Ανάλυση του στόχου σου." },
      { name_en: "Monthly Retainer", name_el: "Μηνιαίο Retainer", price: 800, duration: 0, desc_en: "Ongoing support.", desc_el: "Συνεχής υποστήριξη." },
      { name_en: "Audit", name_el: "Audit", price: 300, duration: 0, desc_en: "Written review + actions.", desc_el: "Γραπτή αξιολόγηση + actions." },
    ],
    bookCta_en: "Book a call",
    bookCta_el: "Κλείσε κλήση",
  },
  {
    id: "restaurant",
    label: "Restaurant / Café",
    wordmark: "TABLE",
    tagline_en: "Eat well",
    tagline_el: "Καλό φαγητό",
    hero: {
      pill_en: "Reservations open",
      pill_el: "Κρατήσεις ανοιχτές",
      title_en: "A table",
      title_el: "Ένα τραπέζι",
      titleAccent_en: "waiting for you.",
      titleAccent_el: "που σε περιμένει.",
      subtitle_en:
        "Seasonal menu, warm service, careful plates. Reserve a table online.",
      subtitle_el:
        "Εποχιακό μενού, ζεστή εξυπηρέτηση. Κλείστε τραπέζι online.",
    },
    services: [
      { name_en: "Table for 2", name_el: "Τραπέζι για 2", price: 0, duration: 90, desc_en: "Dinner reservation.", desc_el: "Κράτηση για δείπνο." },
      { name_en: "Table for 4", name_el: "Τραπέζι για 4", price: 0, duration: 90, desc_en: "Dinner reservation.", desc_el: "Κράτηση για δείπνο." },
      { name_en: "Private Event", name_el: "Ιδιωτική Εκδήλωση", price: 0, duration: 180, desc_en: "Book the room.", desc_el: "Κλείστε όλο τον χώρο." },
      { name_en: "Chef's Tasting", name_el: "Γεύμα Σεφ", price: 55, duration: 120, desc_en: "Multi-course tasting.", desc_el: "Πολλά πιάτα tasting." },
    ],
    bookCta_en: "Reserve a table",
    bookCta_el: "Κλείσε τραπέζι",
  },
];

export function getPreset(id: string): IndustryPreset | undefined {
  return INDUSTRY_PRESETS.find((p) => p.id === id);
}
