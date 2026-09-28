<!--
  SkeletonBlock — grey pulsing placeholder shown where content will appear while loading.
  Size and shape come from the classes you pass:
    <SkeletonBlock class="h-40 w-full" />   <SkeletonBlock class="h-4 w-2/3 rounded-full" />
  Skeletons keep the layout stable, so the page doesn't "jump" when data arrives.
-->
<template>
  <div
    class="animate-pulse rounded-lg bg-muted/15 motion-reduce:animate-none"
    aria-hidden="true"
  ></div>
</template>
