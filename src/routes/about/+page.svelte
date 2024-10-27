<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;
</script>

<a href="/" class="underline">back</a>
<ul>
    {#each data.groups as group}
        <li>{group.id} {group.session} {group.eyes}</li>
    {/each}
</ul>
