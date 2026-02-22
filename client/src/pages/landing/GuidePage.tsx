import { 
  LayoutDashboard, 
  Dumbbell, 
  PlusCircle, 
  ScrollText, 
  CalendarClock, 
  Users, 
  UserCircle,
  ChevronRight,
  PlayCircle,
  BookOpen
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 px-4 sm:px-6">
      
      {/* HEADER SECTION */}
      <div className="relative p-10 sm:p-20 rounded-[2.5rem] border border-[#27273a] bg-[#111118] overflow-hidden shadow-2xl">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 mb-8">
            <ScrollText className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">
              Master the Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-white leading-none uppercase italic">
            FITTRACK <span className="text-amber-400">GUIDE</span>
          </h1>
          
          <p className="mt-8 max-w-2xl text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
            Everything you need to know about the FitTrack ecosystem. Detailed walkthroughs for both 
            <strong> Trainers</strong> and <strong>Clients</strong>.
          </p>
        </div>
      </div>

      {/* --- TRAINER SECTION --- */}
      <div className="pt-10">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400/50">Trainer Perspective</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-amber-400/20 to-transparent" />
        </div>

        <div className="space-y-24">
          <StepSection
            number="01"
            title="Trainer Dashboard"
            icon={<LayoutDashboard className="text-amber-400" />}
            description="Your central command center. Get a bird's-eye view of your weekly performance, work hours, and active client count. The weekly schedule helps you stay on top of today's grind."
            image="/images/TrainerDashboard.png"
            features={["Weekly Session Count", "Work Hours Tracking", "Live Weekly Schedule"]}
          />

          <StepSection
            number="02"
            title="Exercise Library"
            icon={<Dumbbell className="text-cyan-400" />}
            description="Build your professional movement database. Browse through your added exercises, categorized by difficulty and type. This library serves as the foundation for your training programs."
            image="/images/ExercisesLibrary.png"
            features={["Difficulty Tags", "Category Filtering", "Quick Edit/Delete"]}
          />

          <StepSection
            number="03"
            title="Adding Movements"
            icon={<PlusCircle className="text-amber-400" />}
            description="Populate your library with custom exercises. Add technique cues, select target muscle groups, and attach YouTube URLs so your clients can see the perfect form in action."
            image="/images/ExerciseForm.png"
            features={["YouTube Integration", "Technique Cues", "Muscle Group Selection"]}
          />

          <StepSection
            number="04"
            title="Training Programs"
            icon={<ScrollText className="text-violet-400" />}
            description="Create structured routines for your clients. Filter through your program list, search for specific clients, and manage existing builds with a clean, high-performance interface."
            image="/images/TrainingPrograms.png"
            features={["Client Filtering", "Difficulty Levels", "Quick Search"]}
          />

          <StepSection
            number="05"
            title="Program Creation"
            icon={<PlusCircle className="text-emerald-400" />}
            description="Start a new program from scratch. Give it a title, a difficulty level, and assign it directly to a client. This is where your coaching strategy takes its digital form."
            image="/images/ProgramAssign.png"
            features={["Direct Client Assignment", "Difficulty Scaling", "Detailed Descriptions"]}
          />

          <StepSection
            number="06"
            title="Workout Structuring"
            icon={<PlayCircle className="text-amber-400" />}
            description="The core of your coaching. Add exercises from your library to specific programs. Define sets, reps, tempo, and rest intervals. Everything your client needs to succeed."
            image="/images/ProgramExerciseAdd.png"
            features={["Custom Sets & Reps", "Tempo & Rest Intervals", "Coaching Notes"]}
          />

          <StepSection
            number="07"
            title="Training Schedule"
            icon={<CalendarClock className="text-cyan-400" />}
            description="Manage your availability and bookings. Create new training sessions by selecting a program, setting the date, time, and capacity. Track upcoming sessions at a glance."
            image="/images/TrainingSchedule.png"
            features={["Session Capacity", "Duration Settings", "Upcoming Session List"]}
          />

          <StepSection
            number="08"
            title="Client Roster"
            icon={<Users className="text-amber-400" />}
            description="Monitor your professional network. View all your active clients, access their detailed profiles, and keep track of their personal progress and program history."
            image="/images/ClientList.png"
            features={["Client Search", "Profile Quick-Access", "Email Integration"]}
          />

          <StepSection
            number="09"
            title="Professional Profile"
            icon={<UserCircle className="text-slate-400" />}
            description="Manage your identity. Update your personal information, track your total career stats (sessions/programs), and ensure your certification status is up to date."
            image="/images/TrainerProfile.png"
            features={["Career Statistics", "Personal Info Updates", "Account Management"]}
          />
        </div>
      </div>

      {/* --- CLIENT SECTION --- */}
      <div className="pt-24 border-t border-[#27273a]">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400/50">Client Experience</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-cyan-400/20 to-transparent" />
        </div>

        <div className="space-y-24">
          <StepSection
            number="01"
            title="Client Dashboard"
            icon={<LayoutDashboard className="text-cyan-400" />}
            description="Welcome to your fitness hub. See your upcoming sessions, quick stats about your training history, and easy access to your assigned programs."
            image="/images/ClientDashboard.png"
            features={["Upcoming Bookings", "Training Statistics", "Quick Navigation"]}
          />

          <StepSection
            number="02"
            title="Session Booking"
            icon={<CalendarClock className="text-amber-400" />}
            description="Take control of your schedule. Browse available slots created by your trainer and book your spot with one click. Real-time capacity tracking ensures you never miss a workout."
            image="/images/ClientSessionsPage.png"
            features={["One-Tap Booking", "Availability Overview", "Attendance Tracking"]}
          />

          <StepSection
            number="03"
            title="Your Programs"
            icon={<BookOpen className="text-violet-400" />}
            description="Access the road to results. View all training programs specifically designed for you by your coach. Clear organization helps you stay focused on your long-term goals."
            image="/images/MyProgramsPageClient.png"
            features={["Personalized Routine List", "Difficulty Indicators", "Trainer Notes"]}
          />

          <StepSection
            number="04"
            title="Program Details"
            icon={<PlayCircle className="text-cyan-400" />}
            description="Never guess a movement again. Each program includes detailed exercise breakdowns, sets, reps, and video demonstrations to ensure perfect execution and safety."
            image="/images/ProgramDetailClient.png"
            features={["Video Demonstrations", "Set & Rep Schemes", "Execution Instructions"]}
          />

          <StepSection
            number="05"
            title="Personal Progress"
            icon={<UserCircle className="text-emerald-400" />}
            description="Your fitness identity. Manage your personal details, monitor your training volume over time, and keep your contact information synced with your trainer."
            image="/images/ClientProfile.png"
            features={["Personal Stats", "Profile Customization", "Account Security"]}
          />
        </div>
      </div>
    </div>
  );
}

// POMOĆNA KOMPONENTA ZA SEKCIJE UPUTSTVA
function StepSection({ number, title, description, icon, image, features }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group">
      <div className="space-y-6 order-2 lg:order-1">
        <div className="flex items-center gap-4">
          <span className="text-5xl font-black text-[#27273a] group-hover:text-amber-400/20 transition-colors">
            {number}
          </span>
          <div className="h-px flex-grow bg-[#27273a]" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#111118] border border-[#27273a]">
            {icon}
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
            {title}
          </h2>
        </div>

        <p className="text-slate-400 font-medium leading-relaxed">
          {description}
        </p>

        <ul className="space-y-3">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
              <ChevronRight size={14} className="text-amber-400" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative order-1 lg:order-2">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-transparent blur opacity-20 group-hover:opacity-40 transition-opacity rounded-[2rem]" />
        <div className="relative rounded-[2rem] border border-[#27273a] bg-[#111118] overflow-hidden shadow-2xl">
          <div className="h-8 border-b border-[#27273a] bg-[#0a0a0f] flex items-center px-4 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#27273a]" />
            <div className="w-2 h-2 rounded-full bg-[#27273a]" />
            <div className="w-2 h-2 rounded-full bg-[#27273a]" />
          </div>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
}
