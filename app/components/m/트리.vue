<template>
  <div class="space-y-3 ">
    <UInput
      v-model="filterText"
      class="w-full"
      :placeholder="props.placeholder"
      icon="i-lucide-search"
    />
    <UTree
      v-model="selectedNodes"
      :items="filteredItems"
      :get-key="getNodeKey"
      :multiple="props.is여러개"
    />
  </div>
</template>

<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

interface Props {
  items?: TreeItem[]
  placeholder?: string
  is여러개?: boolean
}

const defaultItems: TreeItem[] = [
  {
    label: 'app/',
    defaultExpanded: true,
    children: [
      {
        label: 'composables/',
        children: [
          {
            label: 'useAuth.ts',
            icon: 'i-vscode-icons-file-type-typescript'
          },
          {
            label: 'useUser.ts',
            icon: 'i-vscode-icons-file-type-typescript'
          }
        ]
      },
      {
        label: 'components/',
        defaultExpanded: true,
        children: [
          {
            label: 'Card.vue',
            icon: 'i-vscode-icons-file-type-vue'
          },
          {
            label: 'Button.vue',
            icon: 'i-vscode-icons-file-type-vue'
          }
        ]
      }
    ]
  },
  {
    label: 'app.vue',
    icon: 'i-vscode-icons-file-type-vue'
  },
  {
    label: 'nuxt.config.ts',
    icon: 'i-vscode-icons-file-type-nuxt'
  }
]

const props = withDefaults(defineProps<Props>(), {
  placeholder: '...',
  is여러개: false
})

const filterText = ref('')
const selectedModel = defineModel<string[] | string | undefined>()
const toNodeKey = (value: unknown): string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') return getNodeKey(value as TreeItem)
  return undefined
}

const selectedNodes = computed<string[] | string | undefined>({
  get: () => {
    if (props.is여러개) {
      if (Array.isArray(selectedModel.value)) return selectedModel.value
      return selectedModel.value ? [selectedModel.value] : []
    }

    if (Array.isArray(selectedModel.value)) return selectedModel.value[0]
    return selectedModel.value
  },
  set: (value) => {
    if (props.is여러개) {
      const normalized = (Array.isArray(value) ? value : value ? [value] : [])
        .map(toNodeKey)
        .filter((v): v is string => Boolean(v))
      selectedModel.value = normalized
      return
    }

    selectedModel.value = toNodeKey(Array.isArray(value) ? value[0] : value)
  }
})

const getNodeKey = (node: TreeItem) => {
  return String((node as { id?: unknown }).id ?? node.label ?? '')
}

const filteredItems = computed(() => {
  const query = filterText.value.trim().toLowerCase()

  if (!query) {
    return props.items ?? defaultItems
  }

  const filterTree = (nodes: TreeItem[]): TreeItem[] => {
    return nodes.reduce<TreeItem[]>((acc, node) => {
      const children = Array.isArray(node.children) ? filterTree(node.children) : []
      const label = String(node.label ?? '').toLowerCase()
      const isMatched = label.includes(query)

      if (isMatched || children.length > 0) {
        acc.push({
          ...node,
          children: children.length > 0 ? children : undefined
        })
      }

      return acc
    }, [])
  }

  return filterTree(props.items ?? defaultItems)
})
</script>
