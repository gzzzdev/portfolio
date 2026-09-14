export const useAlert = () => {
  const toast = useToast()

  const log = (title: string, sub: string | string[]) => {
    if (Array.isArray(sub)) {
      sub = sub.join(', ')
    };

    toast.add({

      title: title,
      description: sub,
      color: 'info',
      duration: 500, // 기본 3초.
      progress: false

    })
  }

  const show = (title: string, sub: string | string[]) => {
    if (Array.isArray(sub)) {
      sub = sub.join(', ')
    };

    toast.add({

      title: title,
      description: sub,
      // duration: 500,//기본 3초.
      duration: 3000, // 기본 3초.
      progress: false

    })
  }

  const error = (title: string, sub: string | string[]) => {
    if (Array.isArray(sub)) {
      sub = sub.join(', ')
    };

    toast.add({
      title: title,
      description: sub,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000, // 기본 3초.
      progress: false

    })
  }
  const success = (title: string, sub: string | string[] = '') => {
    if (Array.isArray(sub)) {
      sub = sub.join(', ')
    };
    const safeTitle = title?.trim() || '완료'
    const safeDescription = sub?.trim() || undefined

    toast.add({
      title: safeTitle,
      description: safeDescription,
      type: 'foreground' as const,
      color: 'success',
      icon: 'i-lucide-check-circle',
      duration: 3200,
      progress: !true
    })
  }
  const action = (msg: string, label: string, onClick: () => void) => {
    const configs = {
      title: msg,
      type: 'foreground' as const,
      duration: 0, // 10000,
      icon: 'i-material-symbols-light-download',
      progress: false,
      actions: [{
        size: 'lg' as const,
        label: label,
        color: 'neutral' as const,
        variant: 'outline' as const,
        onClick: onClick
      }]
    }
    toast.add(configs)
  }
  return {
    log,
    show,
    error,
    success,
    action
  }
}
