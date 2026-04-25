// seed.js — Populate AccessiGo database with initial locations (Supabase)
import dotenv from 'dotenv';
dotenv.config();
import db from './db.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱  Seeding AccessiGo database…\n');

  try {
    // ── Seed admin user ──────────────────────────────────────
    const adminHash = await bcrypt.hash('admin1234', 10);
    
    const { data: adminCheckData } = await db
      .from('users')
      .select('id')
      .eq('email', 'admin@accessigo.ph');

    let adminId;
    if (!adminCheckData || adminCheckData.length === 0) {
      const { data: adminData, error: adminError } = await db
        .from('users')
        .insert([{
          name: 'Admin User',
          email: 'admin@accessigo.ph',
          password: adminHash,
          role: 'admin'
        }])
        .select();

      if (adminError) throw adminError;
      adminId = adminData[0].id;
      console.log('✅  Created admin user');
    } else {
      adminId = adminCheckData[0].id;
      console.log('ℹ️   Admin user already exists');
    }

    // ── Seed demo user ───────────────────────────────────────
    const demoHash = await bcrypt.hash('demo1234', 10);
    
    const { data: demoCheckData } = await db
      .from('users')
      .select('id')
      .eq('email', 'demo@accessigo.ph');

    if (!demoCheckData || demoCheckData.length === 0) {
      await db
        .from('users')
        .insert([{
          name: 'Demo User',
          email: 'demo@accessigo.ph',
          password: demoHash,
          role: 'user'
        }]);
      console.log('✅  Created demo user');
    } else {
      console.log('ℹ️   Demo user already exists');
    }

    // ── Location data ────────────────────────────────────────
    const LOCATIONS = [
      // RAMPS
      { name:"Barangay Hall — Main Entrance",   type:"ramp",     street:"Sta. Rita St., Zone 1",       description:"Gently sloped concrete ramp, handrails both sides. Wide enough for power wheelchairs.", rating:5, check_ins:14, map_x:"31%", map_y:"44%", audio_cue:"Barangay Hall ramp ahead. Gentle slope with handrails on both sides. Proceed forward and you will find the entrance on the left." },
      { name:"Sta. Rita Parish Church",          type:"ramp",     street:"Church Road, Zone 2",          description:"Newly installed ramp at the main church entrance. No side rail on left; approach carefully.", rating:3, check_ins:9,  map_x:"52%", map_y:"28%", audio_cue:"Sta. Rita Parish Church ahead. Ramp is gentle but has no left rail. Enter with caution. Mass schedule is posted at the gate." },
      { name:"Sta. Rita Day Care Center",        type:"ramp",     street:"Purok 3, Zone 3",              description:"Low ramp at day care entrance. Suitable for strollers and standard wheelchairs.", rating:4, check_ins:7,  map_x:"22%", map_y:"62%", audio_cue:"Day Care Center ramp is ahead on the right. Low incline, smooth surface. Main door opens inward." },
      { name:"Senior Citizens Center",           type:"ramp",     street:"Rizal Ave., Zone 1",           description:"Dedicated PWD and senior entrance with ramp and grab bars. Well-maintained.", rating:5, check_ins:18, map_x:"68%", map_y:"38%", audio_cue:"Senior Citizens Center ahead. Dedicated accessible entrance on your right with ramp and grab bars. Staff are ready to assist." },
      { name:"Sta. Rita Health Center",          type:"ramp",     street:"Health Center Rd., Zone 2",    description:"Double ramp at main entrance. One ramp under repair — use the south ramp.", rating:3, check_ins:11, map_x:"44%", map_y:"58%", audio_cue:"Health Center ahead. Use the south ramp on your right. North ramp is under repair. Consultations are first come first served." },
      { name:"Public Market — Gate A",           type:"ramp",     street:"Market St., Zone 4",           description:"Accessible ramp at Gate A. Gate B has stairs only. Surface may be wet and slippery early morning.", rating:3, check_ins:6,  map_x:"78%", map_y:"52%", audio_cue:"Public Market Gate A ahead. Ramp access only at this gate. Caution: surface may be wet in the morning." },
      // AUDIO GUIDES
      { name:"Barangay Hall — Audio Kiosk",     type:"audio",    street:"Sta. Rita St., Zone 1",        description:"Interactive audio kiosk announcing barangay services, schedules, and emergency contacts.", rating:5, check_ins:10, map_x:"34%", map_y:"46%", audio_cue:"You are at the Barangay Hall audio kiosk. Press the large button to hear available services. Office hours are Monday to Friday, 8 AM to 5 PM." },
      { name:"Sta. Rita Chapel Wayside",         type:"audio",    street:"Chapel Lane, Zone 2",          description:"Audio waypoint at the chapel intersection. Announces road names and safe crossing directions.", rating:4, check_ins:8,  map_x:"55%", map_y:"31%", audio_cue:"Intersection of Chapel Lane and Rizal Avenue. Traffic light is 10 meters ahead. Cross when you hear the chirping signal." },
      { name:"Sta. Rita Elementary School",     type:"audio",    street:"School Road, Zone 3",          description:"Audio guide at school main gate. Announces enrollment periods, events, and class schedules.", rating:4, check_ins:5,  map_x:"62%", map_y:"64%", audio_cue:"Sta. Rita Elementary School main gate ahead. School hours are 7:30 AM to 4:30 PM. Enrollment is ongoing at the principal's office." },
      { name:"Basketball Court Junction",        type:"audio",    street:"Purok 5 Road, Zone 4",         description:"Audio waypoint at the court junction. Active in evenings. Helpful for navigating Purok 5.", rating:3, check_ins:4,  map_x:"20%", map_y:"35%", audio_cue:"Basketball Court junction. Purok 5 road continues straight. The community hall is 50 meters to your left." },
      { name:"Sta. Rita Health Center Desk",    type:"audio",    street:"Health Center Rd., Zone 2",    description:"Audio guide at the health center reception for patients with visual impairments.", rating:5, check_ins:7,  map_x:"47%", map_y:"60%", audio_cue:"Welcome to the Sta. Rita Health Center. Press 1 for check-up, Press 2 for pharmacy, Press 3 for vaccination schedule." },
      // ELEVATORS
      { name:"Sta. Rita Multi-Purpose Hall",    type:"elevator", street:"Zone 1, near Barangay Hall",   description:"Platform lift for stage access. Request key from barangay staff. Operates during events only.", rating:4, check_ins:5,  map_x:"29%", map_y:"50%", audio_cue:"Multi-Purpose Hall platform lift is at the side entrance. Request the key from the blue door on your right." },
      { name:"Sta. Rita Health Center — 2F",    type:"elevator", street:"Health Center Rd., Zone 2",    description:"Small passenger elevator to second floor. Capacity: 3 persons or 1 wheelchair.", rating:3, check_ins:9,  map_x:"46%", map_y:"63%", audio_cue:"Health Center elevator is inside the building, turn left at the main entrance. Capacity is one wheelchair at a time." },
      // PUBLIC SERVICES
      { name:"Barangay Hall",                    type:"service",  street:"Sta. Rita St., Zone 1",        description:"Main government office. Services include clearances, assistance programs, and emergency response.", rating:5, check_ins:22, map_x:"31%", map_y:"42%", audio_cue:"Barangay Hall. Main office is straight ahead past the ramp. Business hours are 8 AM to 5 PM, Monday to Friday." },
      { name:"Sta. Rita Health Center",          type:"service",  street:"Health Center Rd., Zone 2",    description:"Free consultations, vaccination, and referral services. PWD priority lane available.", rating:5, check_ins:15, map_x:"43%", map_y:"55%", audio_cue:"Sta. Rita Health Center. PWD and senior citizens have priority lanes. Pharmacy is to the right of the main counter." },
      { name:"Purok 1 Community Store",          type:"service",  street:"Purok 1, Zone 1",              description:"Community-run sari-sari store with wide aisles and low counters accessible to wheelchair users.", rating:4, check_ins:3,  map_x:"18%", map_y:"53%", audio_cue:"Purok 1 community store. Wide entrance with no step. Low counters for wheelchair access. Open 6 AM to 10 PM." },
      { name:"Water Station — Zone 2",           type:"service",  street:"Rizal Ave., Zone 2",           description:"Accessible water refilling station. Push-button dispensers at wheelchair height.", rating:4, check_ins:4,  map_x:"58%", map_y:"44%", audio_cue:"Water refilling station ahead. Dispensers are at wheelchair height. Bring your container. Open until 9 PM." },
      { name:"Sta. Rita Elementary School",     type:"service",  street:"School Road, Zone 3",          description:"Public elementary school. Accessible comfort rooms and ground-floor classrooms for PWD students.", rating:4, check_ins:8,  map_x:"61%", map_y:"62%", audio_cue:"Sta. Rita Elementary School. Accessible comfort rooms are near the main building entrance. Principal's office is to the right." },
      { name:"Senior Citizens Center",           type:"service",  street:"Rizal Ave., Zone 1",           description:"Social services, livelihood programs, and daily activity center for senior citizens and PWDs.", rating:5, check_ins:12, map_x:"66%", map_y:"36%", audio_cue:"Senior Citizens Center. Programs include free meals, physical therapy, and livelihood training. Fully accessible building." },
      { name:"Public Market — Sta. Rita",        type:"service",  street:"Market St., Zone 4",           description:"Main public market. PWD-designated lanes. Wet market has uneven floors — use dry market aisle.", rating:3, check_ins:10, map_x:"79%", map_y:"50%", audio_cue:"Sta. Rita Public Market. Use Gate A for ramp access. Designated PWD lane is the center aisle. Watch for wet floors." },
      { name:"Sta. Rita Fire Station",           type:"service",  street:"Zone 4, Main Road",            description:"Emergency services. Ground floor accessible. Call 117 for fire emergencies.", rating:4, check_ins:3,  map_x:"82%", map_y:"30%", audio_cue:"Fire Station is on your left. Ground floor is accessible. In case of emergency dial 117." },
      // PARKS
      { name:"Sta. Rita Mini Park",              type:"park",     street:"Zone 2, near Chapel",          description:"Small community park with paved pathways, benches, and a covered rest area. Fully wheelchair accessible.", rating:5, check_ins:11, map_x:"50%", map_y:"38%", audio_cue:"Sta. Rita Mini Park entrance is ahead. Paved pathways and shaded benches are available. The fountain is on your right." },
      { name:"Purok 3 Covered Court",            type:"park",     street:"Purok 3, Zone 3",              description:"Barangay covered court. Used for community events. Level floor, accessible entrances on all sides.", rating:4, check_ins:7,  map_x:"24%", map_y:"70%", audio_cue:"Purok 3 covered court ahead. Level surface, accessible from all sides. Community events are posted on the bulletin board at the entrance." },
      { name:"Zone 4 Barangay Plaza",            type:"park",     street:"Zone 4, Main Road",            description:"Open plaza used for community gatherings. Paved, flat, and accessible. Benches available.", rating:4, check_ins:6,  map_x:"75%", map_y:"68%", audio_cue:"Barangay Plaza ahead. Open, flat, and paved surface. Benches are available on the right side. Restrooms are at the far end." },
      // HAZARDS
      { name:"Rizal Ave. Broken Pavement",       type:"danger",   street:"Rizal Ave., Zone 2 corner",    description:"Large crack and sunken pavement near the intersection. Reported to DPWH. Avoid with wheelchairs.", rating:1, check_ins:17, map_x:"60%", map_y:"47%", audio_cue:"Warning! Broken pavement ahead on the right side of Rizal Avenue. Cross to the left sidewalk or use the alternate path on Purok 4 Road." },
      { name:"Market St. Flooded Drain",         type:"danger",   street:"Market St., near Gate B",      description:"Open drainage canal floods during rain. No cover. Extremely hazardous after heavy rain.", rating:1, check_ins:13, map_x:"74%", map_y:"55%", audio_cue:"Danger! Open drainage canal on Market Street near Gate B. Floods during rain. Use alternate route via Purok 5 Road." },
      { name:"Narrow Sidewalk — Zone 3",         type:"danger",   street:"School Road, Zone 3",          description:"Sidewalk too narrow for wheelchairs due to parked motorcycles. Best avoided between 7–9 AM.", rating:2, check_ins:8,  map_x:"64%", map_y:"70%", audio_cue:"Caution. Narrow sidewalk on School Road in Zone 3. Blocked by parked motorcycles in the morning. Use the road shoulder with care." },
      { name:"Chapel Road — Steep Incline",      type:"danger",   street:"Chapel Road, Zone 2",          description:"Steep downhill slope. No guardrails. Dangerous for manual wheelchair users when wet.", rating:2, check_ins:9,  map_x:"52%", map_y:"24%", audio_cue:"Warning. Steep incline ahead on Chapel Road. No guardrails. Manual wheelchair users should take the alternate flat route via Church Lane." },
    ];

    // ── Insert locations ─────────────────────────────────────
    const { count: existingLocations } = await db
      .from('locations')
      .select('*', { count: 'exact', head: true });

    if (existingLocations === 0) {
      const locationsToInsert = LOCATIONS.map(loc => ({
        ...loc,
        reported_by: adminId,
        status: 'active'
      }));

      const { error } = await db
        .from('locations')
        .insert(locationsToInsert);

      if (error) throw error;
      console.log(`✅  Inserted ${LOCATIONS.length} locations`);
    } else {
      console.log(`ℹ️   Locations already seeded (${existingLocations} rows). Skipping.`);
    }

    console.log('\n🔑  Seed credentials:');
    console.log('   Admin  → admin@accessigo.ph  / admin1234');
    console.log('   Demo   → demo@accessigo.ph   / demo1234');
    console.log('\n✅  Seed complete.\n');

  } catch (error) {
    console.error('❌  Seed error:', error.message || error);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase().then(() => process.exit(0));
