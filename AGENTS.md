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
- Keep appearance (theme, accent, logo colors) in browser storage per demo account and apply it to the root element after mounting; visual preferences do not need a backend.
- Color components with theme tokens (`--primary`, `--primary-bright`, `--primary-deep`, `--hero`, `--tone-mint`, `--aurora-*`) rather than hex values, so every theme and custom accent recolors them.
- Keep extended student-journey content in LongJourney using global design tokens; this keeps the landing route focused and preserves platform destinations.
- The student dashboard, school-admin portal, and platform-admin console are client-rendered demos whose state lives in browser storage; the login form still posts real (non-demo) credentials to the hosted ByeUni pages.
- Other students' profiles open at `/dashboard?view=profile&person=<id>` through `ProfileLink`; password change, deactivate, and delete live in the Accounts Center `security` tab and only touch demo browser storage.
- Like Instagram, the student avatar menu only holds your profile, Settings, and Sign out; account, money, appearance, privacy, and support options live in Settings (`/dashboard?view=settings&tab=<section>`), and every section, Accounts Center included, opens in the Settings panel rather than a separate page.
- Other students' CVision pages open read-only at `/dashboard?view=cvision&person=<id>`; their content is sample data from `cvisionFor` in `cvision-data`.
- Use the shared `Dropdown` (`components/ui/dropdown.tsx`) instead of native `<select>`; scrollbars are hidden globally in the base layer, so scroll areas must not re-enable them.
- School-admin actions stay scoped to the admin's own school; publishing, payouts, and platform-wide moderation remain with the platform admin.
- CVision portfolio themes, fonts, and layouts are CSS variables on `.cvp-page` (prefixed `cvp-` to avoid the landing page's `cv-` classes); GitHub and LeetCode activity is seeded sample data until real accounts are connected on byeuni.com.
