<script lang="ts">
  import type { Entry as EntryType } from "../../entries/index.ts";
  import { Transaction } from "../../entries/index.ts";
  import { _ } from "../../i18n.ts";
  import ModalBase from "../../modals/ModalBase.svelte";
  import Extract from "./Extract.svelte";
  import ExtractFeedRow from "./ExtractFeedRow.svelte";

  interface Props {
    entries: EntryType[];
    save: () => void;
    close: () => void;
  }

  let { entries = $bindable(), save, close }: Props = $props();

  let phase: "triage" | "review" = $state("triage");

  function isReady(entry: EntryType): boolean {
    if (entry.is_duplicate()) {
      return false;
    }
    if (entry instanceof Transaction) {
      if (!entry.payee) {
        return false;
      }
      if (entry.postings.length < 2) {
        return false;
      }
      if (entry.postings.some((p) => !p.account)) {
        return false;
      }
    }
    return true;
  }

  let readyStates: boolean[] = $state(entries.map((e) => isReady(e)));

  let reviewCount = $derived(readyStates.filter((r) => !r).length);
  let readyCount = $derived(readyStates.filter((r) => r).length);
  let count = $derived(entries.length);
  let shown = $derived(count > 0 && phase === "triage");

  let reviewEntries: EntryType[] = $state([]);
  let readyEntries: EntryType[] = $state([]);

  function processExceptions() {
    readyEntries = entries.filter((_, i) => readyStates[i] === true);
    reviewEntries = entries.filter((_, i) => readyStates[i] === false);

    if (reviewEntries.length > 0) {
      phase = "review";
    } else {
      finalize();
    }
  }

  function finalize() {
    entries = [...readyEntries, ...reviewEntries];
    save();
  }

  function toggleAll() {
    const allReady = readyCount === count;
    readyStates = readyStates.map(() => !allReady);
  }
</script>

{#if phase === "triage"}
  <ModalBase {shown} closeHandler={close}>
    <div class="extract-feed flex-column">
      <div class="header flex-row">
        <h3>
          {_("Import Triage")} ({readyCount}
          {_("Ready")}, {reviewCount}
          {_("Review")})
        </h3>
        <span class="spacer"></span>
        <button type="button" class="muted" onclick={close}
          >{_("Cancel")}</button
        >
        <button type="button" onclick={processExceptions}
          >{_("Process Exceptions")}</button
        >
      </div>

      <ol
        class="flex-table journal show-transaction show-cleared show-pending show-other show-balance show-document show-custom show-note show-event show-query show-pad"
      >
        <li class="header">
          <p>
            <span class="datecell">{_("Date")}</span>
            <span class="flag">{_("F")}</span>
            <span class="description">{_("Narration/Payee")}</span>
            <span class="actions" style="width: 100px; text-align: right;">
              <label class="ready-toggle" title={_("Toggle All")}>
                {_("Ready")}
                <input
                  type="checkbox"
                  checked={readyCount === count}
                  onclick={toggleAll}
                />
              </label>
            </span>
          </p>
        </li>
        {#each entries as entry, i (i)}
          <ExtractFeedRow
            {entry}
            bind:ready={
              () => readyStates[i] ?? false,
              (v: boolean) => {
                readyStates[i] = v;
              }
            }
          />
        {/each}
      </ol>
    </div>
  </ModalBase>
{:else if phase === "review"}
  <Extract
    bind:entries={reviewEntries}
    save={finalize}
    close={() => {
      phase = "triage";
    }}
  />
{/if}

<style>
  .extract-feed {
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .header {
    align-items: center;
    margin-bottom: 1rem;
  }

  .header h3 {
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .ready-toggle {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    cursor: pointer;
  }
</style>
