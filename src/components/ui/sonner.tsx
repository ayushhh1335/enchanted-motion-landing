import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * App toasts: solid cards in theme tones at the bottom center, clear of the top bar and the
 * Messages pill, and lifted above the tab bar on phones.
 */
export function Toaster(props: ToasterProps) {
  return <Sonner
    position="bottom-center"
    closeButton
    visibleToasts={4}
    gap={10}
    offset={24}
    mobileOffset={{ bottom: 'calc(80px + env(safe-area-inset-bottom))', left: 12, right: 12 }}
    icons={{
      success: <CircleCheck />,
      error: <CircleAlert />,
      warning: <TriangleAlert />,
      info: <Info />,
      loading: <LoaderCircle className="bu-toast-spin" />,
      close: <X />,
    }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast: 'bu-toast',
        content: 'bu-toast-content',
        title: 'bu-toast-title',
        description: 'bu-toast-desc',
        icon: 'bu-toast-icon',
        closeButton: 'bu-toast-close',
        actionButton: 'bu-toast-action',
        cancelButton: 'bu-toast-cancel',
      },
    }}
    {...props}
  />;
}
