import { useEffect, useCallback, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_COMPLETED_KEY = 'handball-tour-completed';

const tourSteps = [
  {
    element: '#file-controls',
    popover: {
      title: 'Kontrolki plików',
      description: 'Tutaj możesz przesłać istniejący plik Excel, utworzyć nowy plik lub pobrać zmienione dane.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#upload-btn',
    popover: {
      title: 'Przesyłanie pliku',
      description: 'Kliknij tutaj, aby przesłać plik XLSX z danymi zawodników. Każdy arkusz Excel zostanie załadowany jako osobna grupa (np. rocznik lub drużyna).',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#new-file-btn',
    popover: {
      title: 'Nowy plik',
      description: 'Rozpocznij od nowa z pustym plikiem. Możesz dodać zawodników i grupy według potrzeb.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#download-btn',
    popover: {
      title: 'Pobieranie pliku',
      description: 'Po zakończeniu edycji kliknij tutaj, aby pobrać plik XLSX ze wszystkimi zmianami.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#group-tabs',
    popover: {
      title: 'Zakładki grup',
      description: 'Każdy arkusz Excel jest wyświetlany jako osobna zakładka. Kliknij, aby przełączać się między grupami. Kliknij dwukrotnie, aby zmienić nazwę.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#add-group-btn',
    popover: {
      title: 'Dodawanie grup',
      description: 'Dodaj nową grupę zawodników. Każda grupa będzie osobnym arkuszem w pliku Excel.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#player-table',
    popover: {
      title: 'Tabela zawodników',
      description: 'Tutaj edytujesz dane zawodników. Kliknij na komórkę, aby zmienić wartość.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#player-name-cols',
    popover: {
      title: 'Dane osobowe',
      description: 'Wprowadź imię i nazwisko zawodnika. Maksymalnie 15 znaków dla każdego pola.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#sprint-col',
    popover: {
      title: 'Test 30m sprintu',
      description: 'Wprowadź czas sprintu w sekundach. Wynik punktowy jest obliczany automatycznie na podstawie tabeli punktacji.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#medicine-ball-col',
    popover: {
      title: 'Rzut piłką lekarską',
      description: 'Wprowadź odległość rzutu przodem i tyłem. Suma jest obliczana automatycznie.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#other-scores-col',
    popover: {
      title: 'Punktacja ręczna',
      description: 'Wyniki dla pięcioskoku, rzutu ręcznego i koperty musisz wprowadzić ręcznie, korzystając z tabeli punktacji. Automatycznie obliczany jest tylko sprint 30m oraz suma rzutów piłką lekarską.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#add-player-btn',
    popover: {
      title: 'Dodawanie zawodników',
      description: 'Kliknij tutaj, aby dodać nowego zawodnika do aktualnej grupy.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#scoring-link',
    popover: {
      title: 'Tabela punktacji',
      description: 'Kliknij tutaj, aby zobaczyć szczegółowe tabele punktacji dla wszystkich testów. Pomaga to ustalić, ile punktów przysługuje za dany wynik.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#help-btn',
    popover: {
      title: 'Pomoc',
      description: 'Możesz ponownie uruchomić ten samouczek w dowolnym momencie, klikając ten przycisk.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },
  {
    popover: {
      title: 'To wszystko!',
      description: 'Teraz możesz zarządzać danymi testowymi zawodników. Powodzenia! 🤾',
      side: 'over' as const,
    },
  },
];

interface TourGuideProps {
  onTourStart?: () => void;
  onTourEnd?: () => void;
}

export function useTourGuide() {
  const onTourEndRef = useRef<(() => void) | undefined>(undefined);

  const startTour = useCallback((onEnd?: () => void) => {
    onTourEndRef.current = onEnd;

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Dalej',
      prevBtnText: 'Wstecz',
      doneBtnText: 'Gotowe',
      progressText: 'Krok {{current}} z {{total}}',
      popoverClass: 'tour-popover',
      steps: tourSteps,
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        driverObj.destroy();
        onTourEndRef.current?.();
      },
    });

    driverObj.drive();
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  }, []);

  const isTourCompleted = useCallback(() => {
    return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
  }, []);

  return { startTour, resetTour, isTourCompleted };
}

export default function TourGuide({ onTourStart, onTourEnd }: TourGuideProps) {
  const { startTour } = useTourGuide();
  const hasAutoStarted = useRef(false);

  useEffect(() => {
    // Auto-start tour for first-time users
    if (hasAutoStarted.current) return;

    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!tourCompleted) {
      hasAutoStarted.current = true;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        onTourStart?.();
        startTour(onTourEnd);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startTour, onTourStart, onTourEnd]);

  // This component doesn't render anything visible
  return null;
}
