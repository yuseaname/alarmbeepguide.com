export interface Comment {
  id: string
  text: string
  votes: number
  author: string
  timestamp: number
  category?: string
}

export interface SeasonalTip {
  id: string
  season: string
  title: string
  description: string
  category: string
}

export interface BeepPattern {
  id: string
  name: string
  pattern: string
  device: string
  category: string
  description: string
}

export const getCurrentSeason = (): string => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

export const seasonalTips: SeasonalTip[] = [
  {
    id: 'winter-1',
    season: 'winter',
    title: 'Monthly Smoke Detector Tests',
    description: 'Winter heating systems can trigger false alarms. Test monthly and clean dust buildup from vents.',
    category: 'chirp-beep-codes'
  },
  {
    id: 'winter-2',
    season: 'winter',
    title: 'Weather Radio Battery Check',
    description: 'Storm season means power outages. Verify your weather radio backup batteries are fresh.',
    category: 'weather-outage-alerts'
  },
  {
    id: 'spring-1',
    season: 'spring',
    title: 'Daylight Savings Alarm Updates',
    description: 'Change smoke detector batteries when you change clocks. Easy habit, maximum safety.',
    category: 'chirp-beep-codes'
  },
  {
    id: 'spring-2',
    season: 'spring',
    title: 'Motion Light Sensitivity Adjustment',
    description: 'Longer days mean different light levels. Adjust motion sensor sensitivity to prevent daytime triggers.',
    category: 'home-flood-lights'
  },
  {
    id: 'summer-1',
    season: 'summer',
    title: 'High Humidity CO Detector Care',
    description: 'Summer humidity can affect CO detectors. If you get false alarms, check placement away from bathrooms.',
    category: 'chirp-beep-codes'
  },
  {
    id: 'summer-2',
    season: 'summer',
    title: 'Fire Extinguisher Inspection Season',
    description: 'Warm weather is perfect for outdoor extinguisher inspections. Check pressure gauges on garage units.',
    category: 'fire-extinguishers'
  },
  {
    id: 'fall-1',
    season: 'fall',
    title: 'Pre-Winter Safety Device Audit',
    description: 'Before cold weather hits, test all alarms, replace batteries, and verify heating system sensors.',
    category: 'household-alert-fixes'
  },
  {
    id: 'fall-2',
    season: 'fall',
    title: 'Shorter Days = Motion Light Recalibration',
    description: 'Adjust motion light timers for earlier activation as daylight shortens. Test dusk-to-dawn sensors.',
    category: 'home-flood-lights'
  }
]

export const beepPatterns: BeepPattern[] = [
  {
    id: 'single-chirp-30s',
    name: 'Single chirp every 30 seconds',
    pattern: 'chirp-30s',
    device: 'Smoke Detector',
    category: 'chirp-beep-codes',
    description: 'Low battery warning. Replace battery immediately to restore protection.'
  },
  {
    id: 'three-beeps-pause',
    name: 'Three beeps, pause, repeat',
    pattern: '3-beep-repeat',
    device: 'CO Detector',
    category: 'chirp-beep-codes',
    description: 'Carbon monoxide detected. Evacuate immediately and call emergency services.'
  },
  {
    id: 'continuous-alarm',
    name: 'Continuous loud alarm',
    pattern: 'continuous',
    device: 'Smoke Detector',
    category: 'chirp-beep-codes',
    description: 'Smoke or fire detected. Follow your fire escape plan immediately.'
  },
  {
    id: 'five-chirps',
    name: 'Five chirps in a row',
    pattern: '5-chirp',
    device: 'CO Detector',
    category: 'chirp-beep-codes',
    description: 'End of life warning. Replace the entire unit within 30 days.'
  },
  {
    id: 'flashing-red',
    name: 'Flashing red light',
    pattern: 'flash-red',
    device: 'Motion Sensor',
    category: 'home-flood-lights',
    description: 'Low battery or sensor obstruction. Check battery and clear sensor lens.'
  },
  {
    id: 'rapid-blinking',
    name: 'Rapid blinking when activated',
    pattern: 'rapid-blink',
    device: 'Flood Light',
    category: 'home-flood-lights',
    description: 'Bulb or wiring issue. Check bulb connection and inspect wiring for damage.'
  }
]

export const trustPages = {
  about: {
    title: 'About AlarmBeepGuide',
    content: `AlarmBeepGuide exists to decode the confusing beeps, chirps, and alerts from household safety devices—without requiring you to dig through product manuals or technical jargon.

We started this resource after hearing too many stories of homeowners ignoring important safety alerts simply because they didn't understand what the beep meant. A smoke detector chirp at 2 AM shouldn't require a YouTube search and 20 minutes of frustration. You deserve instant, plain-English answers.

**Our Mission**

Empower every homeowner with clear, tested troubleshooting guidance for alarm systems, safety devices, and household alert systems. We translate technical beep codes into actionable solutions you can trust.

**What Makes Us Different**

• **No Manuals Needed**: We decode alert patterns in plain English
• **Tested Solutions**: Our troubleshooting steps are verified and practical
• **Homeowner-First**: Written for real people, not technicians
• **Safety-Focused**: We prioritize your family's safety above all else
• **No Hype**: Honest, straightforward guidance without exaggeration

**Our Approach**

Every piece of content follows a simple formula:
1. What does this beep mean?
2. Is it urgent or routine?
3. How do I fix it safely?
4. When should I call a professional?

We don't make medical claims. We don't offer legal advice. We don't recommend specific brands unless there's a clear safety advantage. We simply help you understand what your devices are telling you.

**Who We Serve**

Homeowners, renters, property managers, and anyone responsible for maintaining household safety systems. If you've ever been woken up by a mysterious chirp or wondered why your motion light won't stop blinking, we're here for you.

**Our Commitment**

We update content regularly, correct errors promptly, and listen to your feedback. This site grows stronger with every question you ask and every solution we document.

Safety shouldn't be complicated. Let's decode those beeps together.`
  },
  disclosure: {
    title: 'Advertising Disclosure',
    content: `**How We Keep AlarmBeepGuide Free**

AlarmBeepGuide is a free educational resource supported by advertising. We believe critical safety information should be accessible to everyone, and ad revenue allows us to maintain and expand this platform without charging readers.

**Advertising Partners**

This website participates in the Google AdSense program and may display contextual advertisements throughout the site. These ads are selected automatically based on content relevance and user interests.

We may also participate in affiliate programs where qualifying purchases through our links earn us a small commission at no additional cost to you.

**What This Means for You**

• Content remains 100% free to access
• Ads help fund research, updates, and site improvements
• We never hide safety information behind paywalls
• Editorial independence is maintained—ads don't influence our guidance

**Our Advertising Standards**

We maintain strict standards for advertising on this site:
• Ads must not misrepresent safety information
• We don't accept ads promoting dangerous products or practices
• Sponsored content (if any) is clearly labeled
• Affiliate relationships are disclosed where applicable

**Editorial Independence**

Advertising revenue does not influence our editorial process. Safety recommendations are based on research, testing, and best practices—never on commercial relationships.

If we recommend a product, it's because we genuinely believe it serves your safety needs, not because we earn a commission.

**Your Privacy**

Ad networks may use cookies and tracking technologies to serve relevant ads. Please see our Privacy Policy for details on how data is collected and used.

**Questions?**

If you have concerns about advertising on this site, please contact us. We're committed to maintaining trust while keeping this resource free and accessible.

**Last Updated**: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  },
  editorialPolicy: {
    title: 'Editorial Policy',
    content: `**Our Commitment to Accuracy**

AlarmBeepGuide maintains rigorous editorial standards to ensure every piece of safety information you read is accurate, practical, and trustworthy.

**Research Standards**

Every article undergoes a thorough research process:
• Cross-reference manufacturer specifications and safety guidelines
• Consult industry standards from NFPA, UL, and consumer safety organizations
• Verify troubleshooting steps through testing when possible
• Review user experiences and common failure patterns

**Content Creation Process**

1. **Research**: Gather information from authoritative sources
2. **Verification**: Cross-check facts against multiple reliable sources
3. **Plain-English Translation**: Convert technical jargon into clear guidance
4. **Safety Review**: Ensure recommendations prioritize user safety
5. **Publication**: Publish with clear sourcing and context

**What We Don't Do**

• Make medical or health claims
• Provide legal advice
• Recommend DIY repairs beyond homeowner skill level
• Exaggerate risks or use fear-based marketing
• Copy content from manufacturers without adding value

**Sources We Trust**

• National Fire Protection Association (NFPA)
• Underwriters Laboratories (UL)
• U.S. Consumer Product Safety Commission
• Manufacturer technical documentation
• Licensed electrician and fire safety expert guidance

**Expertise & Limitations**

We focus on common household safety devices and alert systems. Complex electrical work, gas appliance repairs, and professional-grade systems should always involve licensed professionals.

When we can't provide a complete DIY solution, we clearly state when to call an expert.

**Homeowner-First Perspective**

Our content is written for regular homeowners, not electricians or technicians. We assume you:
• Have basic household tools
• Can follow step-by-step instructions
• Know when to stop and call a professional
• Prioritize safety over saving money

**Continuous Improvement**

We regularly review and update content to reflect:
• New product technologies
• Updated safety standards
• Reader feedback and questions
• Improved troubleshooting methods

**Your Role**

We encourage readers to:
• Report errors or outdated information
• Share new troubleshooting insights
• Ask questions when guidance isn't clear
• Suggest topics we haven't covered

Together, we build a more comprehensive and accurate safety resource.`
  },
  factChecking: {
    title: 'Fact-Checking Policy',
    content: `**How We Verify Safety Information**

AlarmBeepGuide publishes troubleshooting guidance for household safety devices. Every guide is reviewed to ensure it is accurate, practical, and safe for homeowners to follow.

**What We Check**

- Manufacturer documentation (manuals, spec sheets, service bulletins)
- Safety standards from organizations like NFPA and UL
- Reputable consumer safety sources and government advisories
- Consistency with known device behaviors and common failure patterns

**Verification Process**

1. **Source validation**: We confirm that technical claims match official documentation.
2. **Practical testing**: When feasible, we validate steps against real-world device behavior.
3. **Risk review**: We flag steps that may require professional help (gas, CO, electrical).
4. **Clarity check**: We rewrite complex guidance into plain-English instructions.

**When We Update**

We update articles when:
- manufacturers change alert patterns or recommended fixes
- safety standards are revised
- readers report errors or missing steps

**Corrections**

If you spot an issue, we document the correction and update the page promptly. See our Corrections Policy for details.

**Need to Report an Error?**

Contact us through the Contact page with the article URL and the correction details.`
  },
  correctionsPolicy: {
    title: 'Corrections Policy',
    content: `**Our Commitment to Accuracy**

When we make a mistake, we fix it quickly and transparently. Safety information must be accurate, and we take errors seriously.

**How We Handle Corrections**

**Minor Errors** (typos, formatting, non-critical details)
• Corrected immediately upon discovery
• No special notification required
• Updated timestamp reflects change

**Significant Errors** (incorrect safety guidance, wrong specifications, misleading information)
• Corrected immediately
• Correction note added at top of article
• Updated timestamp and "Last Reviewed" date
• Explanation of what was corrected and why

**Critical Safety Errors** (information that could cause harm if followed)
• Immediate correction across all platforms
• Prominent correction notice displayed
• Review of related content for similar issues
• Social media/email notification if applicable

**How to Report an Error**

If you spot an error, please contact us immediately with:
• URL of the page
• Description of the error
• Correct information (if known)
• Your contact information (optional)

We typically respond within 24-48 hours and make corrections within the same timeframe.

**What Qualifies as an Error**

• Factually incorrect information
• Outdated safety standards
• Misleading troubleshooting steps
• Broken or incorrect links
• Contradictory guidance within our site

**What Doesn't Require Correction**

• Difference of opinion on best practices
• Alternate troubleshooting methods that also work
• Brand-specific variations in procedures
• Stylistic preferences

**Transparency**

We maintain a corrections log for significant errors, available upon request. This helps us:
• Track common error patterns
• Improve our editorial process
• Maintain accountability
• Build reader trust

**Prevention**

We work to prevent errors through:
• Multi-source fact verification
• Regular content audits
• Reader feedback integration
• Expert review when available

**Our Promise**

We will never:
• Hide corrections or pretend errors didn't happen
• Blame readers for our mistakes
• Delay critical safety corrections
• Remove legitimate criticism

Your safety depends on accurate information. We take that responsibility seriously.

**Contact**: For urgent safety corrections, please use our contact form with "URGENT CORRECTION" in the subject line.`
  },
  contact: {
    title: 'Contact AlarmBeepGuide',
    content: `**We're Here to Help**

Have a question about a mysterious beep? Found an error? Want to suggest a topic? We'd love to hear from you.

**What We Can Help With**

• Identifying alarm beep patterns
• Troubleshooting safety device issues
• Clarifying our guidance
• Reporting errors or outdated information
• Suggesting new content topics
• General safety device questions

**What We Can't Help With**

• Emergency situations (call 911 or your local emergency number)
• Professional electrical or fire safety inspections
• Legal or medical advice
• Brand-specific support (contact manufacturer directly)
• Installation or repair quotes

**Response Time**

We typically respond within 24-48 hours during business days. Emergency situations require immediate professional help—please don't wait for our response if safety is at risk.

**Before You Contact Us**

Check if your question is already answered:
• Search our site using the search bar
• Browse our category pages
• Review our FAQ sections

**Urgent Safety Issues**

If you smell smoke, suspect carbon monoxide, or face an immediate safety threat:
1. Get to safety immediately
2. Call emergency services
3. Contact us later if you'd like to share your experience

**Partnership Inquiries**

For business partnerships, advertising questions, or collaboration opportunities, please include "PARTNERSHIP" in your subject line.

**Website Issues**

If you're experiencing technical problems with our website:
• Clear your browser cache and try again
• Try a different browser
• Report the specific page and error message

**Your Privacy**

Information you share through our contact form is used only to respond to your inquiry. See our Privacy Policy for details.

**Mailing Address**

AlarmBeepGuide
[Address to be configured]

**Thank You**

Your questions help us improve this resource for everyone. Every beep pattern you ask about becomes content that helps the next homeowner solve their problem faster.

We're grateful you're here, and we're committed to helping you decode those confusing alerts.`
  },
  privacy: {
    title: 'Privacy Policy',
    content: `**Your Privacy Matters**

AlarmBeepGuide is committed to protecting your privacy while providing free, ad-supported safety education.

**Last Updated**: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

**Information We Collect**

**Automatically Collected**
• Page views and site navigation patterns
• Device type, browser, and operating system
• Referring website or search terms
• Geographic location (city/region level, not precise)
• Time spent on pages

**Voluntarily Provided**
• Contact form submissions (name, email, message)
• Comment submissions (if you choose to participate)
• Search queries within our site
• User preferences and settings

**How We Use Your Information**

• Improve site content and user experience
• Respond to your inquiries
• Analyze which topics are most helpful
• Detect and prevent security issues
• Comply with legal obligations

**Cookies & Tracking**

We use cookies for:
• Site functionality (remembering preferences)
• Analytics (understanding site usage)
• Advertising (via Google AdSense and partners)

You can control cookies through your browser settings.

**Third-Party Services**

**Google AdSense**
Displays contextual advertisements. Google may use cookies to serve relevant ads based on your interests. See Google's Privacy Policy for details.

**Analytics**
We may use analytics services to understand site performance. These services may collect anonymous usage data.

**Data Security**

We implement reasonable security measures to protect your information:
• Encrypted data transmission (HTTPS)
• Secure data storage practices
• Limited access to personal information
• Regular security audits

However, no internet transmission is 100% secure. Use caution when sharing sensitive information online.

**Your Rights**

You have the right to:
• Access your personal information
• Request correction of inaccurate data
• Request deletion of your data (subject to legal requirements)
• Opt out of marketing communications
• Control cookie preferences

**Children's Privacy**

This site is intended for general audiences. We don't knowingly collect information from children under 13. If you believe we've inadvertently collected such information, please contact us immediately.

**Data Retention**

We retain information only as long as necessary for legitimate purposes:
• Contact inquiries: Until resolved + 1 year
• Analytics data: Aggregated and anonymized
• Comments: Indefinitely (unless deletion requested)

**International Visitors**

This site is operated in the United States. By using our site, you consent to data transfer to the U.S., which may have different privacy laws than your country.

**Changes to This Policy**

We may update this policy periodically. Significant changes will be posted with an updated date. Continued use of the site constitutes acceptance of changes.

**Questions**

For privacy questions or to exercise your rights, please contact us through our contact form with "PRIVACY" in the subject line.

**Transparency**

We believe in honest communication about how we use data. If anything in this policy is unclear, please ask. We're happy to explain our practices in plain English.`
  },
  accessibility: {
    title: 'Accessibility Statement',
    content: `**Commitment to Accessibility**

AlarmBeepGuide is committed to ensuring digital accessibility for all users, including those with disabilities. We believe critical safety information must be accessible to everyone.

**Accessibility Standards**

We strive to meet WCAG 2.1 Level AA standards and follow these principles:
• **Perceivable**: Information is presented in ways all users can perceive
• **Operable**: Interface elements are operable by all users
• **Understandable**: Content and operation are clear and predictable
• **Robust**: Content works with current and future assistive technologies

**Features We've Implemented**

**Visual Access**
• High contrast text (minimum 4.5:1 ratio)
• Resizable text without breaking layout
• Clear visual hierarchy and spacing
• Descriptive alt text for images
• No information conveyed by color alone

**Keyboard Navigation**
• Full keyboard accessibility (no mouse required)
• Logical tab order throughout site
• Visible focus indicators
• Skip-to-content links

**Screen Reader Support**
• Semantic HTML structure
• ARIA labels where appropriate
• Descriptive link text (no "click here")
• Proper heading hierarchy
• Form labels and error messages

**Content Clarity**
• Plain language (10th-grade reading level or lower)
• Clear instructions
• Consistent navigation
• Predictable site behavior
• Helpful error messages

**What We're Working On**

While we strive for full accessibility, we recognize ongoing improvement is necessary:
• Expanding video captions and transcripts
• Improving mobile touch target sizes
• Adding more visual alternatives for audio content
• Enhancing form accessibility
• Regular accessibility audits

**Assistive Technology Compatibility**

This site has been tested with:
• JAWS screen reader
• NVDA screen reader
• VoiceOver (iOS/macOS)
• Keyboard-only navigation
• Browser zoom (up to 200%)
• High contrast mode

**Known Issues**

We're actively working to resolve:
• Some third-party ad content may not meet accessibility standards
• Certain interactive features may have limited screen reader support
• Not all legacy content has been fully updated to current standards

**Your Feedback Matters**

If you encounter accessibility barriers:
• Let us know what doesn't work
• Tell us what assistive technology you're using
• Describe the problem or barrier
• Suggest improvements

Contact us with "ACCESSIBILITY" in the subject line for priority response.

**Alternative Formats**

If you need content in an alternative format:
• Large print
• Audio version
• Simplified language
• Other accommodations

Please contact us, and we'll work to provide the information in a format that works for you.

**Third-Party Content**

While we control our content accessibility, some third-party elements (ads, embedded content) may not meet our standards. We're working with partners to improve this.

**Regular Reviews**

We conduct accessibility reviews:
• Quarterly audits of new content
• Annual full-site accessibility audit
• Ongoing user feedback incorporation
• Updates to match evolving standards

**Our Commitment**

Accessibility isn't a one-time project—it's an ongoing commitment. We will:
• Prioritize accessibility in all new features
• Fix reported issues promptly
• Train our team on accessibility best practices
• Engage users with disabilities in our improvement process

**Legal Compliance**

We aim to comply with:
• Americans with Disabilities Act (ADA)
• Section 508 of the Rehabilitation Act
• Web Content Accessibility Guidelines (WCAG 2.1 AA)

**Questions?**

For accessibility questions, concerns, or accommodation requests, please contact us. We typically respond within 48 hours and treat accessibility issues as high priority.

Safety information saves lives. Making that information accessible to everyone isn't just good practice—it's our responsibility.

**Last Reviewed**: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  }
}

export interface TopComment extends Comment {
  rank: number
  badge: 'gold' | 'silver' | 'bronze'
}
