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
