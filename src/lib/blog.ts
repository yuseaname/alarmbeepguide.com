export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishDate: string
  lastUpdated?: string
  readTime: number
  featured: boolean
  tags: string[]
  metaTitle: string
  metaDescription: string
  faqs?: { question: string; answer: string }[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 'smoke-detector-chirping-low-battery',
    slug: 'smoke-detector-chirping-low-battery',
    title: 'Why Is My Smoke Detector Chirping? The Low Battery Fix',
    excerpt: 'That single chirp every 30 seconds means low battery. Learn how to replace it safely and stop the noise for good.',
    content: `If your smoke detector is chirping once every 30 seconds, you're hearing a low battery warning. This is the most common alarm sound homeowners encounter, and the fix is straightforward.

## What That Chirp Means

A single chirp every 30-60 seconds is your detector's way of saying "I need a new battery soon." The detector is still working, but it won't be for long. Most detectors will chirp for 30 days before the battery dies completely.

**Important**: A continuous alarm is different—that means smoke or fire. Evacuate immediately if you hear a continuous alarm.

## The 5-Minute Fix

**What You'll Need**:
- Fresh 9-volt battery (or AA batteries, depending on your model)
- Step stool or ladder
- Your detector's manual (optional—you probably don't have it, and that's okay)

**Steps**:

1. **Locate the chirping detector**. If you have multiple units, listen carefully to identify which one is chirping.

2. **Twist the detector counterclockwise** to remove it from its mounting bracket. Most detectors twist off easily.

3. **Remove the old battery**. Look for a battery compartment door or simply pull the battery connector free.

4. **Install the fresh battery**. Match the + and - terminals correctly. The detector won't work if it's backward.

5. **Test the detector**. Press and hold the test button for 3-5 seconds. You should hear a loud, continuous alarm. Release the button.

6. **Reinstall the detector**. Twist it clockwise back onto the mounting bracket until it clicks into place.

## When It's Not Just the Battery

If the chirping continues after replacing the battery:

**Try This**:
- Wait 5 minutes after installation for the detector to reset
- Check that the battery is fully seated and making good contact
- Verify you installed a fresh battery (test it in another device)
- Look for a small reset button on the detector and press it

**If Chirping Persists**:
The detector may have reached end of life. Most smoke detectors last 10 years, then need complete replacement. Check the manufacture date on the back—if it's over 10 years old, replace the entire unit.

## Pro Tips to Prevent Future Chirping

- Change batteries twice a year when you change clocks for daylight savings
- Write the installation date on the detector with a permanent marker
- Buy batteries in bulk and keep spares in a kitchen drawer
- Set a phone reminder for battery replacement every 6 months

## When to Call a Professional

You shouldn't need an electrician for battery changes. However, call a professional if:
- The detector is hardwired and you're uncomfortable working with electrical connections
- Multiple detectors chirp simultaneously (may indicate interconnection issues)
- The detector chirps even after replacing both the battery and the entire unit
- You smell burning plastic or see scorch marks near the detector

## FAQs

**Q: Can I just remove the battery to stop the chirping?**
A: Technically yes, but don't. You're removing critical fire protection. Replace the battery immediately instead.

**Q: Will a cheap battery work?**
A: Use quality alkaline batteries. Cheap batteries die faster and may leak, damaging your detector.

**Q: My detector chirps randomly, not every 30 seconds.**
A: Random chirps often indicate dust buildup or end of life. Clean with a vacuum brush attachment first. If chirping continues, replace the unit.

**Q: Is it safe to delay replacement for a few days?**
A: The detector still works during the chirp phase, but don't wait long. Batteries can die suddenly, leaving you unprotected.

## The Bottom Line

A chirping smoke detector is annoying, but it's your device doing its job—warning you before it fails. Spend 5 minutes replacing the battery now, and you'll have uninterrupted sleep and continuous fire protection.

Keep fresh batteries on hand, test monthly, and replace detectors every 10 years. These three habits keep your family safe without the 2 AM wake-up calls.`,
    category: 'chirp-beep-codes',
    author: 'AlarmBeepGuide Team',
    publishDate: '2024-01-15',
    lastUpdated: '2024-01-15',
    readTime: 4,
    featured: true,
    tags: ['smoke detector', 'low battery', 'chirping', 'troubleshooting'],
    metaTitle: 'Why Is My Smoke Detector Chirping? Fix Low Battery Beeps',
    metaDescription: 'Stop the chirping! Learn what smoke detector beeps mean and how to replace the battery safely. 5-minute fix with no tools needed.',
    faqs: [
      {
        question: 'Can I just remove the battery to stop the chirping?',
        answer: 'While you can remove the battery, you should not do so. Removing the battery eliminates critical fire protection. Replace the battery immediately instead.'
      },
      {
        question: 'Will a cheap battery work in my smoke detector?',
        answer: 'Use quality alkaline batteries. Cheap batteries die faster and may leak, which can damage your detector.'
      },
      {
        question: 'My detector chirps randomly, not every 30 seconds. What does that mean?',
        answer: 'Random chirps often indicate dust buildup or end of life. Clean the detector with a vacuum brush attachment first. If chirping continues after cleaning, replace the entire unit.'
      }
    ]
  },
  {
    id: 'carbon-monoxide-detector-beeping-patterns',
    slug: 'carbon-monoxide-detector-beeping-patterns',
    title: 'Carbon Monoxide Detector Beeping: What Each Pattern Means',
    excerpt: 'Different CO detector beep patterns signal different problems. Learn which patterns require evacuation and which need simple fixes.',
    content: `Carbon monoxide detectors use different beep patterns to communicate specific warnings. Knowing the difference between these patterns could save your life.

## The Critical Pattern: Evacuate Immediately

**4 Beeps, Pause, 4 Beeps (Repeating)**

This is the emergency alarm. It means carbon monoxide has been detected at dangerous levels.

**What to Do**:
1. Get everyone outside immediately
2. Call 911 or emergency services from outside
3. Do not re-enter until emergency responders say it's safe
4. Do not assume it's a false alarm

Carbon monoxide is odorless and invisible. If your detector alarms, take it seriously even if you feel fine. CO poisoning symptoms (headache, dizziness, nausea) can feel like the flu.

## The Annoying Pattern: Low Battery

**Single Chirp Every 30-60 Seconds**

Just like smoke detectors, this chirp means low battery.

**What to Do**:
1. Replace the battery immediately
2. Test the detector using the test button
3. Never remove the battery without replacing it

Most CO detectors use 9-volt or AA batteries. Check your specific model.

## The Replacement Pattern: End of Life

**5 Beeps Every Minute** or **Continuous Chirp**

CO detectors expire after 5-7 years (check your model). This pattern means the sensor has reached end of life.

**What to Do**:
1. Check the manufacture date on the back of the detector
2. Purchase a new CO detector immediately
3. Install the new detector before removing the old one
4. Do not ignore this warning—an expired detector may not protect you

## The Troubleshooting Pattern: Malfunction Alert

**Erratic Beeps** or **Different Pattern Than Above**

Some detectors have specific malfunction alerts—often irregular beeps that don't match the patterns above.

**What to Do**:
1. Check your detector's manual or look up the model number online
2. Try resetting the detector (usually a button press)
3. If malfunction persists, replace the detector
4. Don't gamble with a malfunctioning CO detector

## Common False Alarm Causes

CO detectors can alarm falsely when:
- Placed too close to gas appliances (furnace, water heater, stove)
- Exposed to high humidity (bathrooms, kitchens)
- Exposed to cleaning chemicals or aerosols
- Detector is past expiration date

**If You Get a False Alarm**:
1. Evacuate first, verify safety later
2. Have emergency responders check with professional equipment
3. Consider relocating the detector if false alarms continue
4. Replace aging detectors

## Where to Place CO Detectors

**Ideal Locations**:
- One on every level of your home
- Near sleeping areas
- At least 15 feet from fuel-burning appliances
- 5 feet from high humidity areas

**Avoid**:
- Garages (car exhaust will trigger false alarms)
- Kitchens (cooking fumes interfere)
- Bathrooms (humidity causes problems)
- Direct sunlight or drafty areas

## When to Call Professionals

Call emergency services (911) if:
- Your detector alarms with the emergency pattern
- Anyone shows CO poisoning symptoms
- You suspect a gas leak

Call an HVAC professional if:
- You have recurring CO alarms
- You want to check potential sources (furnace, water heater)
- You're installing new fuel-burning appliances

## Testing Your CO Detector

Test monthly:
1. Press and hold the test button
2. Wait for the alarm to sound
3. Release the button
4. If it doesn't alarm, replace batteries and test again
5. If it still doesn't work, replace the entire unit

## The Bottom Line

CO detectors save lives, but only if you respond correctly to their warnings. Four beeps repeating means evacuate now. One chirp every minute means replace the battery. Five beeps every minute means replace the detector.

Don't ignore any pattern. When in doubt, evacuate and call for help. False alarms are inconvenient, but CO poisoning is deadly.

Keep fresh batteries on hand, replace detectors every 5-7 years, and test monthly. These simple habits protect your family from the silent killer.`,
    category: 'chirp-beep-codes',
    author: 'AlarmBeepGuide Team',
    publishDate: '2024-01-18',
    lastUpdated: '2024-01-18',
    readTime: 5,
    featured: true,
    tags: ['carbon monoxide', 'CO detector', 'beep patterns', 'safety'],
    metaTitle: 'CO Detector Beeping Patterns: What Each Alarm Sound Means',
    metaDescription: 'Decode carbon monoxide detector beeps. Learn which patterns mean evacuate now vs. simple battery change. Critical safety guide.',
    faqs: [
      {
        question: 'What does 4 beeps mean on a carbon monoxide detector?',
        answer: '4 beeps in a row, followed by a pause, then repeating is the emergency alarm indicating dangerous CO levels have been detected. Evacuate immediately and call 911.'
      },
      {
        question: 'How long do carbon monoxide detectors last?',
        answer: 'Most CO detectors last 5-7 years. Check the manufacture date on the back of your detector and replace it when it reaches expiration.'
      },
      {
        question: 'Can I reset a beeping carbon monoxide detector?',
        answer: 'You can reset some detectors by pressing a reset button, but this should only be done AFTER you have evacuated, called emergency services, and been cleared to return. Never reset an alarming CO detector without investigating the cause.'
      }
    ]
  },
  {
    id: 'motion-sensor-light-stays-on',
    slug: 'motion-sensor-light-stays-on',
    title: 'Motion Sensor Light Won\'t Turn Off? 7 Quick Fixes',
    excerpt: 'Motion lights stuck on all night waste electricity and defeat the purpose. Here\'s how to troubleshoot and fix the most common causes.',
    content: `Motion sensor lights that won't turn off are frustrating and wasteful. Before you replace the entire fixture, try these seven proven fixes that solve 90% of stuck-on motion light problems.

## Why Motion Lights Get Stuck On

Motion sensors can stay activated for several reasons:
- Sensitivity set too high
- Obstructions triggering continuous detection
- Faulty sensor or wiring
- Timer settings maxed out
- Light sensitivity (photocell) malfunction

Let's fix them in order of likelihood.

## Fix #1: Adjust the Sensitivity Dial

**Most Common Cause**: Your sensor is detecting tiny movements like swaying plants, small animals, or even moths near the light.

**How to Fix**:
1. Locate the sensitivity dial (usually labeled "SENS" or has +/- symbols)
2. Turn it toward the "-" or lower setting
3. Wait for the current timer cycle to complete
4. Test by walking in the detection zone

Start at medium sensitivity and adjust up if needed. High sensitivity seems better but causes constant triggering.

## Fix #2: Check for Obstructions

**Second Most Common**: Something is constantly moving in the sensor's field of view.

**What to Look For**:
- Tree branches or bushes swaying in wind
- Tall grass or plants that have grown into the detection zone
- Reflective surfaces bouncing motion back to the sensor
- Your neighbor's motion light triggering yours (reflected light)
- Air conditioner exhaust creating heat movement

**The Fix**: Trim vegetation, remove reflective objects, or redirect the sensor angle away from the obstruction.

## Fix #3: Adjust the Timer Setting

**Common Oversight**: Your timer is set to maximum duration, making the light appear to stay on.

**How to Fix**:
1. Find the timer dial (usually labeled "TIME" or has clock symbols)
2. Note the current setting
3. Turn it to the minimum setting (often 1 minute)
4. Test the light—it should turn off quickly when motion stops

Once you confirm this works, adjust to your preferred duration (3-5 minutes is typical).

## Fix #4: Clean the Sensor Lens

**Often Overlooked**: Dirt, spider webs, or debris on the sensor lens can cause erratic behavior.

**How to Clean**:
1. Turn off power at the circuit breaker
2. Gently wipe the sensor lens with a soft, damp cloth
3. Remove any spider webs or insect nests from the fixture
4. Let it dry completely
5. Restore power and test

Clean sensors every 6 months to prevent buildup.

## Fix #5: Check the Photocell (Dusk-to-Dawn Sensor)

**Sneaky Problem**: If the photocell thinks it's dark, the light will run continuously when motion is detected.

**What to Check**:
- Is the photocell covered or blocked?
- Is another light shining on it, confusing it about day/night?
- Is the photocell setting on "TEST" mode instead of "AUTO"?

**The Fix**:
1. Make sure the photocell has a clear view of the sky
2. Switch mode from "TEST" to "AUTO"
3. Test at night—the light should only work when it's dark

## Fix #6: Reset the Motion Sensor

Many sensors can glitch and need a hard reset.

**How to Reset**:
1. Turn off power at the circuit breaker for 30 seconds
2. Turn power back on
3. Wait 60 seconds for the sensor to recalibrate
4. Test the motion detection

This clears temporary errors in the sensor's memory.

## Fix #7: Check for Wiring Issues

**Last Resort**: If nothing above works, you may have wiring problems.

**Warning Signs**:
- Light flickers before staying on
- Sensor feels warm to the touch
- Light works intermittently
- You smell burning plastic

**What to Do**:
- Turn off power immediately if you smell burning
- Check wire connections inside the fixture (power off first!)
- Look for loose wire nuts or corroded connections
- Tighten any loose connections

**When to Call an Electrician**: If you're uncomfortable working with wiring, or if you find damaged wires or burn marks, call a licensed electrician.

## Bonus Tip: Seasonal Adjustments

Motion lights may need sensitivity adjustments with the seasons:
- **Summer**: Lower sensitivity (more insects, plant growth)
- **Winter**: May need higher sensitivity (less ambient movement)

## Testing After Fixes

After making adjustments:
1. Wait for complete timer cycle to finish
2. Stand still in detection zone—light should turn off
3. Walk through zone—light should turn on
4. Walk away and wait—light should turn off after timer duration

## When to Replace the Sensor

Replace the motion sensor if:
- It's more than 10 years old
- Physical damage is visible
- None of these fixes work
- It cycles on/off rapidly (sensor failure)

Quality sensors cost $20-40 and are straightforward to install if you're comfortable with basic wiring.

## Prevention Tips

Keep your motion light working smoothly:
- Clean sensors twice a year
- Trim vegetation seasonally
- Test sensitivity settings after storms
- Check for insect nests monthly during summer
- Keep photocells unobstructed

## The Bottom Line

Most motion sensor lights stuck on can be fixed in under 10 minutes with simple adjustments. Start with sensitivity and timer settings, then check for obstructions and clean the lens.

If electrical fixes don't work or you're uncomfortable with wiring, call a professional. But in most cases, a few dial adjustments will have your motion light working perfectly again—turning on when needed and off when it should.`,
    category: 'home-flood-lights',
    author: 'AlarmBeepGuide Team',
    publishDate: '2024-01-20',
    readTime: 5,
    featured: false,
    tags: ['motion sensor', 'flood light', 'troubleshooting', 'outdoor lighting'],
    metaTitle: 'Motion Sensor Light Won\'t Turn Off? 7 Fixes That Work',
    metaDescription: 'Fix motion lights stuck on with these 7 simple solutions. Adjust sensitivity, check obstructions, reset sensors. Stop wasting electricity tonight.',
    faqs: [
      {
        question: 'Why does my motion light stay on all the time?',
        answer: 'The most common reasons are sensitivity set too high, obstructions in the detection zone, or the timer setting at maximum duration. Start by adjusting the sensitivity dial to a lower setting.'
      },
      {
        question: 'How do I reset my motion sensor light?',
        answer: 'Turn off power at the circuit breaker for 30 seconds, then turn it back on. Wait 60 seconds for the sensor to recalibrate before testing.'
      },
      {
        question: 'Can a dirty sensor cause motion lights to malfunction?',
        answer: 'Yes. Dirt, spider webs, or debris on the sensor lens can cause erratic behavior. Clean the lens with a soft, damp cloth every 6 months.'
      }
    ]
  }
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category)
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured)
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
}

export function getBlogCategories(): { category: string; count: number }[] {
  const categoryCounts = blogPosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count
  }))
}
