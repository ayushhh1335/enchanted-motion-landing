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
- On desktop the student sidebar (`LeftRail`) is a fixed icon dock that expands on hover and must fit the viewport without scrolling; Messages live in the floating `MessagesDock`, notifications open in the `NotificationsPanel` drawer (not a page), Create uses the shared `CreateMenu`, and secondary destinations (Saved, My Vibeys, Settings) go in its More card rather than the dock.
- The student right rail (`RightRail`) is one compact card that fits the viewport; add rows by height priority (`db-rr-tall` hides on short screens) instead of stacking new panels. Student of the Day lives inside the Vibe Check card so it shows at every screen size, not in the rail.
- Settings does not offer Edit profile (that stays on the profile page); its notification and privacy choices are demo preferences saved in browser storage (`byeuni-settings-v1`).
- Settings rows, stored preferences, and the activity log come from `components/settings-kit` and are shared by all three dashboards. My activity opens at `/dashboard?view=settings&tab=activity`, `/admin?section=settings&focus=activity`, and `/school-admin?section=profile&focus=activity`, and is built from each store's existing history rather than a separate log.
- Menus, popovers, dialogs, sheets, drawers, and the expanded dock use the solid `--card` background, never `--glass`, so content underneath never shows through.
- Use the shared `Dropdown` (`components/ui/dropdown.tsx`) instead of native `<select>`; scrollbars are hidden globally in the base layer, so scroll areas must not re-enable them.
- School-admin actions stay scoped to the admin's own school; publishing, payouts, and platform-wide moderation remain with the platform admin.
- The school portal and platform admin console use the student dock pattern through `components/console-dock` (`has-dock`): the busiest sections sit in the dock, every ByeUni menu section is listed in its All sections card, and the mobile sheet and bottom bar stay as they are.
- Student suggestions and the signed-in student's saved profile cross dashboards through `lib/student-sync` (`byeuni-suggestions-v1` plus the dashboard's own storage), so the school portal and admin console see what the student sends without a backend.
- Student profiles in the consoles open read-only at `/school-admin?section=student&focus=<id>` and `/admin?section=student&focus=<id>` through the shared `admin/StudentProfile`; it shows sample CVision data, or the demo student's own saved edits.
- Console alerts (`--tone-rose` inside `.adm-page`) keep text in the foreground color; only icons and borders use the warning red, so Reported, Vibe-Check, and similar pages have no pink text.
- CVision portfolio themes, fonts, and layouts are CSS variables on `.cvp-page` (prefixed `cvp-` to avoid the landing page's `cv-` classes); GitHub and LeetCode activity is seeded sample data until real accounts are connected on byeuni.com.
