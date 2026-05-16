<script lang="ts">
  import type { Entry as EntryType } from "../../entries/index.ts";
  import { Transaction } from "../../entries/index.ts";
  import { _ } from "../../i18n.ts";

  interface Props {
    entry: EntryType;
    ready: boolean;
  }

  let { entry, ready = $bindable() }: Props = $props();

  let duplicate = $derived(entry.is_duplicate());

  let type_class = $derived(entry.t.toLowerCase());
  let flag_class = $derived(
    entry instanceof Transaction
      ? entry.flag === "*"
        ? "cleared"
        : entry.flag === "!"
          ? "pending"
          : "other"
      : "",
  );

  let isInvalid = $derived(
    entry instanceof Transaction &&
      (entry.postings.length < 2 || entry.postings.some((p) => !p.account)),
  );
</script>

<li
  class="{type_class} show-full-entry {flag_class}"
  class:duplicate
  class:invalid={isInvalid}
>
  <p>
    <span class="datecell">{entry.date}</span>
    {#if entry instanceof Transaction}
      <span class="flag">{entry.flag}</span>
      <span class="description">
        <strong class="payee">{entry.payee || ""}</strong>
        {#if entry.payee && entry.narration}<span class="separator"></span>{/if}
        {entry.narration || ""}
      </span>
    {:else}
      <span class="flag">{entry.t.slice(0, 3)}</span>
      <span class="description">
        <strong>{entry.t}</strong>
      </span>
    {/if}
    <span class="actions">
      {#if duplicate}
        <span class="duplicate-badge">{_("Duplicate")}</span>
      {/if}
      <label class="ready-toggle" title={_("Toggle Ready / Review")}>
        <input type="checkbox" bind:checked={ready} />
      </label>
    </span>
  </p>
  {#if entry instanceof Transaction && entry.postings.length > 0}
    <ul class="postings">
      {#each entry.postings as posting, i (i)}
        <li class:missing-account={!posting.account}>
          <p>
            <span class="datecell"></span>
            <span class="flag"></span>
            <span class="description"
              >{posting.account || _("Missing Account")}</span
            >
            <span class="num">{posting.amount}</span>
          </p>
        </li>
      {/each}
      {#if entry.postings.length < 2}
        <li class="missing-account">
          <p>
            <span class="datecell"></span>
            <span class="flag"></span>
            <span class="description">{_("Missing Counteraccount")}</span>
            <span class="num"></span>
          </p>
        </li>
      {/if}
    </ul>
  {/if}
</li>

<style>
  .duplicate {
    opacity: 0.5;
  }

  .actions {
    float: right;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
    width: 100px;
  }

  .duplicate-badge {
    padding: 0.1rem 0.3rem;
    font-size: 0.8em;
    color: var(--color-warning, #856404);
    background: var(--color-warning-background, #fff3cd);
    border-radius: 4px;
  }

  .ready-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .invalid {
    background: var(--color-error-background);
    border-left: 4px solid var(--color-error);
  }

  .missing-account .description {
    font-weight: bold;
    color: var(--color-error);
  }
</style>
