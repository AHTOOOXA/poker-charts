export function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 space-y-8 text-neutral-300 text-sm leading-relaxed">
      <h2 className="text-2xl font-semibold text-white">Disclaimer</h2>

      <section className="space-y-2">
        <h3 className="text-base font-medium text-white">Intended Use</h3>
        <p>
          Poker Lab is an off-the-table study and research tool. It is designed
          for reviewing preflop strategy and browsing historical leaderboard
          results outside of live poker sessions. The author does not use this
          tool during gameplay and does not recommend doing so.
        </p>
        <p>
          Using third-party tools while playing may violate your poker
          platform's terms of service and result in account restrictions or
          permanent bans.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-medium text-white">No Affiliation</h3>
        <p>
          This project is not affiliated with, endorsed by, or connected to
          GGPoker, Natural8, the GG Poker Network, or any other poker operator.
          All trademarks and brand names belong to their respective owners.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-medium text-white">Data Sources</h3>
        <p>
          All leaderboard data displayed in this application is sourced
          exclusively from publicly accessible promotion pages on the Natural8
          website. These pages are available to any visitor without
          authentication or login:
        </p>
        <ul className="list-disc list-inside text-neutral-400 space-y-1">
          <li>Rush & Cash Daily Leaderboard</li>
          <li>Hold'em Daily Leaderboard</li>
        </ul>
        <p>
          No hand histories, private player information, PokerCraft data, or
          in-game data is accessed, collected, or stored. Player nicknames shown
          are publicly visible on these leaderboard pages.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-medium text-white">No Real-Time Assistance</h3>
        <p>
          This application does not interact with any poker client. It does not
          read screen contents, intercept network traffic, overlay information
          during gameplay, or provide real-time decision assistance in any form.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-medium text-white">User Responsibility</h3>
        <p>
          Players are solely responsible for ensuring their use of any tools
          complies with the terms of service of their poker platform. The author
          assumes no liability for any consequences arising from the use of this
          application.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-medium text-white">Content Removal</h3>
        <p>
          If you are a representative of a poker operator and have concerns
          about any data or content displayed in this application, please open
          an issue on the{' '}
          <a
            href="https://github.com/AHTOOOXA/poker-charts/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-200 underline underline-offset-2 hover:text-white"
          >
            GitHub repository
          </a>{' '}
          and it will be addressed promptly.
        </p>
      </section>
    </div>
  )
}
