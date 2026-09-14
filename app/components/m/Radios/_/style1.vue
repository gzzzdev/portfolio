<template>
  <URadioGroup
    orientation="horizontal"
    variant="table"
    size="xs"
    :ui="{
      item: 'flex items-start cursor-pointer'

    }"
  >
    <template #label="{ item }">
      <div class="cursor-pointer">
        {{ item.label }}
      </div>
    </template>
  </URadioGroup>
</template>
