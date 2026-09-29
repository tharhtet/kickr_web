type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'contact'; lines: string[] }
  | { type: 'subheading'; text: string };

type SubSection = {
  heading: string;
  blocks: Block[];
};

type Section = {
  id: string;
  heading: string;
  blocks: Block[];
  subs?: SubSection[];
};

const p = (text: string): Block => ({ type: 'p', text });
const ul = (items: string[]): Block => ({ type: 'ul', items });
const contact = (lines: string[]): Block => ({ type: 'contact', lines });
const subheading = (text: string): Block => ({ type: 'subheading', text });

const sections: Section[] = [
  {
    id: '1',
    heading: '1. Information We Collect',
    blocks: [
      p(
        'We collect information that you provide directly to us, information generated when you use KickR, and information necessary to operate and secure the Service.'
      ),
    ],
    subs: [
      {
        heading: '1.1 Account Information',
        blocks: [
          p('When you create an account, we may collect:'),
          ul([
            'Name',
            'Username',
            'Email address',
            'Password or authentication credentials',
            'Email verification information',
            'Profile picture/avatar',
            'Country',
            'City',
            'Sport type/profile type',
            'Preferred football position',
            'Biography',
            'Account preferences',
            'Privacy settings',
          ]),
          p(
            'You may be able to update some of this information through your profile settings.'
          ),
        ],
      },
      {
        heading: '1.2 Profile Information',
        blocks: [
          p('Your KickR profile may contain information such as:'),
          ul([
            'Name',
            'Username',
            'Profile picture',
            'Biography',
            'Country',
            'City',
            'Sport/profile type',
            'Preferred football position',
            'Match history',
            'Player statistics',
            'Player ratings',
            'Rating comments',
            'Achievements or gallery content',
            'Highlight videos',
            'Group memberships',
          ]),
          p(
            'Some profile information may be visible to other KickR users depending on your privacy settings and the features you use.'
          ),
        ],
      },
    ],
  },
  {
    id: '2',
    heading: '2. Group Information',
    blocks: [
      p('KickR allows users to create and participate in football groups.'),
      p('When you create or join a group, we may collect and store:'),
      ul([
        'Group name',
        'Group description',
        'Team logo',
        'Group wallpaper',
        'Country',
        'City',
        'Home ground',
        'Team rules',
        'Sport type',
        'Group owner information',
        'Group administrators',
        'Group members',
        'Captains',
        'Group invitations',
        'Group membership status',
      ]),
      p(
        'Group owners and administrators may have additional access to information relating to group membership and group activities.'
      ),
    ],
  },
  {
    id: '3',
    heading: '3. Event Information',
    blocks: [
      p('KickR allows users to organize and participate in football events.'),
      p('Event information may include:'),
      ul([
        'Event name',
        'Event description',
        'Match date',
        'Match time',
        'Venue',
        'Maximum number of players',
        'Participating players',
        'Skill level',
        'Participation price or fee',
        'Public/private status',
        'Event status',
        'Team assignments',
        'Match results',
        'Match statistics',
      ]),
      p(
        'If an event is made public, certain event information may be visible to users who are not members of the organizing group.'
      ),
    ],
  },
  {
    id: '4',
    heading: '4. Location Information',
    blocks: [
      p(
        'KickR may allow users to provide a city and country as part of their profile and group information.'
      ),
      p('We may use this information to:'),
      ul([
        'Display relevant football events',
        'Help users discover football communities',
        'Support public event discovery',
        'Display group or event locations',
        'Improve the relevance of the Service',
      ]),
      p(
        'KickR does not need your precise GPS location to provide basic profile and event functionality.'
      ),
      p(
        'If we introduce features that require precise location information, we will request the appropriate device permission and explain how that information is used.'
      ),
    ],
  },
  {
    id: '5',
    heading: '5. QR Codes and Invitation Links',
    blocks: [
      p(
        'KickR may provide QR codes and invitation links that allow users to join football groups or access group-related information.'
      ),
      p('A QR code or invitation link may contain or reference information such as:'),
      ul([
        'Group identifier',
        'Invitation identifier',
        'Invitation expiration date',
        'Group membership information',
      ]),
      p(
        'When another user scans an invitation QR code or opens an invitation link, we may process the associated identifier to determine whether the invitation is valid and allow the user to join or request access to the relevant group.'
      ),
    ],
  },
  {
    id: '6',
    heading: '6. Messages and Chat Content',
    blocks: [
      p(
        'KickR provides group communication features that allow users to communicate with other group members.'
      ),
      p('We may collect and store:'),
      ul([
        'Text messages',
        'Messages associated with a group',
        'Images or videos uploaded to chats',
        'Message timestamps',
        'Sender and recipient/group information',
        'Other content users choose to submit through chat',
      ]),
      p(
        'Chat content is processed to provide the messaging functionality, maintain message history, protect the Service, and investigate reports of abuse or violations of our terms.'
      ),
      p('Users should avoid sharing sensitive personal information through group chats.'),
    ],
  },
  {
    id: '7',
    heading: '7. Player Ratings and Statistics',
    blocks: [
      p('After football matches, users may be able to rate other players.'),
      p('We may collect:'),
      ul([
        'Rating scores',
        'Rating comments',
        'Match-related ratings',
        'Match participation',
        'Player statistics',
        'Match results',
        'Player performance information',
      ]),
      p(
        "Ratings and statistics may become part of a player's profile and may be visible to other users depending on the Service's functionality and privacy settings."
      ),
    ],
  },
  {
    id: '8',
    heading: '8. Financial and Participation Information',
    blocks: [
      p('Groups may use KickR to track group funds or participation-related fees.'),
      p(
        'Depending on the functionality available in the Service, we may process information such as:'
      ),
      ul([
        'Participation fees',
        'Group fund transactions',
        'Payment status',
        'Transaction amounts',
        'Transaction dates',
        'Group financial records',
      ]),
      p(
        'If payments are processed through a third-party payment provider, payment card or banking information may be collected directly by that provider rather than stored by KickR.'
      ),
      p(
        'We do not intend to collect or store complete payment card numbers unless explicitly stated otherwise.'
      ),
    ],
  },
  {
    id: '9',
    heading: '9. Device and Technical Information',
    blocks: [
      p('When you use KickR, we may automatically collect certain technical information, such as:'),
      ul([
        'Device type',
        'Operating system',
        'App version',
        'Device identifiers',
        'IP address',
        'Network information',
        'Language and regional settings',
        'Crash information',
        'Log information',
        'Authentication and session information',
      ]),
      p('We use this information to operate, secure, troubleshoot, and improve the Service.'),
    ],
  },
  {
    id: '10',
    heading: '10. Notifications',
    blocks: [
      p('If you enable notifications, KickR may send notifications relating to:'),
      ul([
        'Event updates',
        'Group activity',
        'Group invitations',
        'Match information',
        'Messages',
        'Membership requests',
        'Ratings',
        'Account activity',
        'Important Service announcements',
      ]),
      p(
        'You can manage notification permissions through your device settings and, where available, through KickR settings.'
      ),
    ],
  },
  {
    id: '11',
    heading: '11. How We Use Your Information',
    blocks: [
      p('We may use information we collect to:'),
      subheading('Provide the Service'),
      ul([
        'Create and manage user accounts',
        'Authenticate users',
        'Maintain profiles',
        'Create and manage football groups',
        'Organize football events',
        'Allow users to join events',
        'Facilitate group communication',
        'Provide player ratings and statistics',
        'Process group-related financial records',
        'Generate QR codes and invitation links',
      ]),
      subheading('Improve the Service'),
      ul([
        'Understand how users interact with KickR',
        'Improve features and functionality',
        'Develop new features',
        'Diagnose technical problems',
        'Monitor application performance',
      ]),
      subheading('Safety and Security'),
      ul([
        'Prevent fraud and abuse',
        'Detect unauthorized access',
        'Protect accounts',
        'Enforce our Terms of Service',
        'Investigate reported violations',
        'Protect users and the Service',
      ]),
      subheading('Communications'),
      ul([
        'Send service-related notifications',
        'Respond to support requests',
        'Send important account or security messages',
        'Provide information about changes to the Service',
      ]),
      p('We may also process information where required or permitted by applicable law.'),
    ],
  },
  {
    id: '12',
    heading: '12. How We Share Information',
    blocks: [
      p(
        'We do not sell your personal information as part of the normal operation of KickR.'
      ),
      p('We may share information in the following circumstances.'),
    ],
    subs: [
      {
        heading: '12.1 With Other Users',
        blocks: [
          p(
            'Depending on the feature and your privacy settings, information may be visible to other KickR users.'
          ),
          p('For example:'),
          ul([
            'Your profile information',
            'Your username',
            'Profile picture',
            'City/country',
            'Player statistics',
            'Match history',
            'Ratings',
            'Group membership',
            'Messages posted in group chats',
            'Public event participation',
          ]),
          p(
            'Information you intentionally post in public areas of KickR may be accessible to other users.'
          ),
        ],
      },
      {
        heading: '12.2 Service Providers',
        blocks: [
          p(
            'We may use third-party service providers to operate KickR, including providers for:'
          ),
          ul([
            'Cloud hosting',
            'Database infrastructure',
            'Authentication',
            'Email delivery',
            'Push notifications',
            'File and image storage',
            'Analytics',
            'Error monitoring',
            'Customer support',
            'Payment processing',
          ]),
          p(
            'These providers may process personal information only as necessary to provide services to us and subject to applicable contractual and legal requirements.'
          ),
        ],
      },
      {
        heading: '12.3 Legal Requirements',
        blocks: [
          p('We may disclose information if reasonably necessary to:'),
          ul([
            'Comply with applicable law',
            'Respond to lawful requests from authorities',
            'Protect our rights or property',
            'Investigate suspected fraud or abuse',
            'Protect the safety of users or others',
            'Enforce our agreements',
          ]),
        ],
      },
      {
        heading: '12.4 Business Transfers',
        blocks: [
          p(
            'If KickR is involved in a merger, acquisition, financing, restructuring, sale of assets, or similar transaction, personal information may be transferred as part of that transaction, subject to applicable law.'
          ),
        ],
      },
    ],
  },
  {
    id: '13',
    heading: '13. Public and Private Information',
    blocks: [
      p(
        'Some KickR features are designed to help users discover football communities and events.'
      ),
      p(
        'Information associated with public groups or public events may be visible to users beyond the members of a particular group.'
      ),
      p(
        'Before publishing information, consider whether you are comfortable sharing it with other users.'
      ),
      p(
        'Group owners and administrators should also avoid publishing sensitive personal information about members without an appropriate legal basis or permission.'
      ),
    ],
  },
  {
    id: '14',
    heading: '14. Your Privacy Settings',
    blocks: [
      p(
        'KickR may provide privacy controls that allow you to manage certain aspects of your profile and activity.'
      ),
      p('Depending on the available functionality, you may be able to control:'),
      ul([
        'Profile visibility',
        'Personal information visibility',
        'Activity visibility',
        'Notification preferences',
        'Other privacy-related settings',
      ]),
      p(
        'Privacy settings may not apply to information that is necessary to provide a feature or information that you intentionally share with other users.'
      ),
    ],
  },
  {
    id: '15',
    heading: '15. Data Retention',
    blocks: [
      p('We retain personal information for as long as reasonably necessary to:'),
      ul([
        'Provide the Service',
        'Maintain your account',
        'Provide match and event history',
        'Maintain group records',
        'Resolve disputes',
        'Prevent fraud and abuse',
        'Meet legal and regulatory obligations',
        'Enforce our agreements',
      ]),
      p(
        'When information is no longer required, we may delete it, anonymize it, or securely retain it where legally necessary.'
      ),
      p('Some information may remain in backups for a limited period after deletion.'),
    ],
  },
  {
    id: '16',
    heading: '16. Account Deletion',
    blocks: [
      p('You may request deletion of your KickR account.'),
      p(
        'Depending on the circumstances, deleting your account may result in deletion or anonymization of information associated with your account.'
      ),
      p(
        'Certain information may need to be retained when required by law, necessary to resolve disputes, prevent fraud, enforce our agreements, or protect the security of the Service.'
      ),
      p(
        "Information that you previously shared with other users, such as messages or group activity, may not always be completely removable from other users' records if technically or legally necessary."
      ),
      p('To request account deletion, contact:'),
      contact(['Email: [privacy@kickrsport.com]']),
    ],
  },
  {
    id: '17',
    heading: '17. Your Privacy Rights',
    blocks: [
      p('Depending on where you live, you may have rights regarding your personal information.'),
      p('These may include the right to:'),
      ul([
        'Access your personal information',
        'Request correction of inaccurate information',
        'Request deletion of personal information',
        'Request restriction of certain processing',
        'Object to certain processing',
        'Request a copy of certain personal information',
        'Withdraw consent where processing is based on consent',
        'Lodge a complaint with an applicable privacy regulator',
      ]),
      p('The availability of these rights depends on applicable law and the circumstances of the request.'),
      p('To exercise a privacy right, contact:'),
      contact(['Privacy Contact: [privacy@kickrsport.com]']),
      p('We may need to verify your identity before fulfilling certain requests.'),
    ],
  },
  {
    id: '18',
    heading: "18. Children's Privacy",
    blocks: [
      p(
        'KickR is not intended for children who are below the minimum age required to use the Service under applicable law.'
      ),
      p(
        'We do not knowingly collect personal information from children in violation of applicable legal requirements.'
      ),
      p(
        'If you believe that a child has provided personal information to KickR without appropriate authorization, please contact us at:'
      ),
      contact(['[privacy@kickrsport.com]']),
      p(
        'If we become aware that we have collected personal information from a child where collection is not permitted, we will take reasonable steps to delete the information as required by applicable law.'
      ),
    ],
  },
  {
    id: '19',
    heading: '19. Data Security',
    blocks: [
      p(
        'We use reasonable technical and organizational measures designed to protect personal information against:'
      ),
      ul(['Unauthorized access', 'Unauthorized disclosure', 'Loss', 'Misuse', 'Alteration', 'Destruction']),
      p(
        'These measures may include authentication controls, access controls, encryption where appropriate, secure storage, and monitoring.'
      ),
      p('However, no internet-based service can guarantee absolute security.'),
      p(
        'You are responsible for protecting your account credentials and should not share your password with other people.'
      ),
    ],
  },
  {
    id: '20',
    heading: '20. Passwords and Authentication',
    blocks: [
      p('KickR may use authentication technologies such as:'),
      ul(['Email verification', 'JWT authentication', 'Refresh tokens', 'Secure credential storage']),
      p('Authentication information is used to protect your account and maintain secure sessions.'),
      p('You should immediately contact us if you believe your account has been accessed without authorization.'),
    ],
  },
  {
    id: '21',
    heading: '21. Cookies and Similar Technologies',
    blocks: [
      p(
        'If KickR provides web-based services, we may use cookies and similar technologies for purposes such as:'
      ),
      ul([
        'Authentication',
        'Maintaining sessions',
        'Security',
        'Remembering preferences',
        'Understanding website usage',
        'Improving performance',
      ]),
      p('You may be able to control cookies through your browser settings.'),
    ],
  },
  {
    id: '22',
    heading: '22. Third-Party Links and Services',
    blocks: [
      p('KickR may contain links to third-party websites, applications, or services.'),
      p('We are not responsible for the privacy practices of third parties.'),
      p(
        'We encourage you to review the privacy policies of third-party services before providing them with personal information.'
      ),
    ],
  },
  {
    id: '23',
    heading: '23. International Data Transfers',
    blocks: [
      p('KickR and our service providers may operate in different countries.'),
      p(
        'As a result, your information may be transferred to or processed in countries other than the country where you live.'
      ),
      p(
        'Where required by applicable law, we will implement appropriate safeguards for international transfers of personal information.'
      ),
    ],
  },
  {
    id: '24',
    heading: '24. Changes to This Privacy Policy',
    blocks: [
      p('We may update this Privacy Policy from time to time to reflect:'),
      ul([
        'Changes to KickR',
        'New features',
        'Changes in applicable law',
        'Changes in our data practices',
        'Security or operational requirements',
      ]),
      p(
        'When we make material changes, we may provide notice through the application, website, email, or other appropriate means.'
      ),
      p(
        'The "Last Updated" date at the top of this Privacy Policy indicates when the policy was most recently updated.'
      ),
    ],
  },
  {
    id: '25',
    heading: '25. Contact Us',
    blocks: [
      p(
        'If you have questions, concerns, or requests regarding this Privacy Policy or how KickR handles personal information, please contact us.'
      ),
      contact([
        'KickR Sport',
        'Privacy Email: [privacy@kickrsport.com]',
        'Company: [Legal Company Name]',
        'Address: [Company Address]',
        'Country: [Country]',
      ]),
    ],
  },
  {
    id: '26',
    heading: '26. Features Covered by This Privacy Policy',
    blocks: [
      p('This Privacy Policy applies to the current KickR Sport functionality, including:'),
      ul([
        'User registration and authentication',
        'User profiles',
        'City and country information',
        'Sport/profile type',
        'Football position',
        'Football groups',
        'Group membership',
        'Group invitations',
        'QR codes and invitation links',
        'Football events',
        'Public events',
        'Event participation',
        'Team challenges',
        'Group chat',
        'Player ratings',
        'Player statistics',
        'Match history',
        'Highlight videos and gallery content',
        'Notifications',
        'Group funds and participation fees',
        'Account and privacy settings',
      ]),
      p('Tournament management is not included in this version of KickR Sport.'),
    ],
  },
];

function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return (
            <p key={i}>
              {block.text}
            </p>
          );
        }
        if (block.type === 'subheading') {
          return (
            <p key={i} className="font-medium text-ink">
              {block.text}
            </p>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <div key={i} className="rounded-md bg-slate-100 p-3 text-slate-700">
            {block.lines.map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </div>
        );
      })}
    </>
  );
}

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          KickR Sport Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-slate-500">Effective Date: September 17, 2026</p>
        <p className="text-sm text-slate-500">Last Updated: September 17, 2026</p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          KickR Sport (&ldquo;KickR&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) is a football community platform that helps users discover
          and organize football events, create and manage football groups, communicate
          with other players, and maintain player profiles, match history, statistics,
          and ratings.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, disclose, retain, and
          protect information when you use the KickR Sport mobile application, website,
          and related services (collectively, the &ldquo;Service&rdquo;).
        </p>
        <p>
          By using KickR, you acknowledge that you have read and understood this
          Privacy Policy.
        </p>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <p>
            <span className="font-semibold">Important:</span> This is a general
            privacy-policy template based on the features you provided. Before
            publishing it, replace the bracketed company/contact details and have it
            reviewed for the countries where KickR operates, particularly if you have
            users in the EU/EEA, UK, US states with comprehensive privacy laws,
            Thailand, or other jurisdictions with specific privacy requirements.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
        {sections.map((section) => (
          <div key={section.id}>
            <h2 className="mb-2 text-base font-semibold text-ink">{section.heading}</h2>
            <div className="space-y-2">
              <RenderBlocks blocks={section.blocks} />
            </div>

            {section.subs && (
              <div className="mt-4 space-y-5 border-l-2 border-slate-200 pl-4">
                {section.subs.map((sub) => (
                  <div key={sub.heading}>
                    <h3 className="mb-2 text-sm font-semibold text-ink">{sub.heading}</h3>
                    <div className="space-y-2">
                      <RenderBlocks blocks={sub.blocks} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
