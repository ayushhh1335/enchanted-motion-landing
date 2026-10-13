<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the landing page at `/` and preserve original ByeUni destinations for account and campaign actions; this redesign does not duplicate the hosted platform.
- Isolate React Three Fiber artwork in `ConnectionScene` and keep its route client-rendered; WebGL requires browser APIs.
- Define visual tokens and reusable motion styles in the global design system; page controls use shared Button and Dialog components.
- Keep theme preferences in browser storage and apply the root dark class after mounting; visual preferences do not need an account or backend.
- Keep extended student-journey content in LongJourney using global design tokens; this keeps the landing route focused and preserves platform destinations.
- The student dashboard, school-admin portal, and platform-admin console are client-rendered demos whose state lives in browser storage; the login form still posts real (non-demo) credentials to the hosted ByeUni pages.
- School-admin actions stay scoped to the admin's own school; publishing, payouts, and platform-wide moderation remain with the platform admin.
