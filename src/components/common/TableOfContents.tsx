'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, ArrowDown, ArrowUp, Share2 } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';

interface Section {
  id: string;
  text: string;
}

interface Props {
  title: string;
}

const HEADER_HEIGHT = 64;
const Threshold = 10;

const TableOfContents = ({ title }: Props) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const sectionElements = document.querySelectorAll<HTMLElement>('section');

    const sectionData: Section[] = Array.from(sectionElements).map((section) => {
      const heading = section.querySelector('h2');
      return {
        id: heading?.textContent?.replace('#', '').trim() ?? '',
        text: heading?.textContent?.replace('#', '').trim() ?? '',
      };
    });

    setSections(sectionData);

    if (sectionData.length > 0) {
      setActiveSection(sectionData[0].text);
    }

    const handleScroll = () => {
      // 페이지 하단 도달 감지
      const bottomReached
        = window.innerHeight + window.scrollY
        >= document.documentElement.scrollHeight - 10;

      setIsAtBottom(bottomReached);

      if (bottomReached && sectionElements.length > 0) {
        const lastSection = sectionElements[sectionElements.length - 1];
        const lastHeading = lastSection.querySelector('h2');
        const lastHeadingText = lastHeading?.textContent?.replace('#', '').trim() ?? '';
        setActiveSection(lastHeadingText);
        return;
      }

      Array.from(sectionElements).forEach((section) => {
        const heading = section.querySelector('h2');
        if (!heading) return;

        const { top: sectionTop, bottom: sectionBottom } = section.getBoundingClientRect();
        const headerLine = HEADER_HEIGHT;
        const headerLineThreshold = headerLine + Threshold;

        if (sectionTop <= headerLineThreshold && sectionBottom >= headerLineThreshold) {
          const headingText = heading.textContent?.replace('#', '').trim() ?? '';
          setActiveSection(headingText);
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = useCallback((sectionId: string): void => {
    const sectionSelector = 'section h2';
    const sections = document.querySelectorAll<HTMLHeadingElement>(sectionSelector);

    const targetSection = Array.from(sections).find(
      (section) => section.textContent?.replace('#', '').trim() === sectionId
    );

    if (targetSection) {
      const y = targetSection.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const scrollToBottom = useCallback((): void => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  const scrollToTop = useCallback((): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const copyCurrentURL = useCallback((): void => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('URL이 복사되었습니다.');
    });
  }, []);

  return (
    <div className='animate-introSecond flex flex-col'>
      <div className='h-[425px] hidden md:block' />
      <div className='sticky top-[132px] hidden md:block'>
        <nav className="space-y-2 text-sm min-w-32">
          <span className='text-main text-base font-bold'>{title}</span>
          {sections.map((section) => (
            <div
              key={section.id}
              className={`cursor-pointer transition-colors underline underline-offset-4 decoration-light hover:text-accent hover:decoration-accent
                  ${ activeSection === section.text ? 'text-primary font-medium decoration-primary' : 'text-sub' }
                `}
              onClick={() => scrollToSection(section.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  scrollToSection(section.id);
                }
              }}
              aria-current={activeSection === section.text ? 'true' : 'false'}
            >
              {section.text}
            </div>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-2">
          <TooltipButton
            isLink
            href="/posts"
            tooltip="목록으로"
          >
            <List className='size-4' />
          </TooltipButton>

          <TooltipButton
            onClick={isAtBottom ? scrollToTop : scrollToBottom}
            tooltip={isAtBottom ? '맨 위로' : '맨 아래로'}
          >
            {isAtBottom ? <ArrowUp className='size-4' /> : <ArrowDown className='size-4' />}
          </TooltipButton>

          <TooltipButton
            onClick={copyCurrentURL}
            tooltip="공유"
          >
            <Share2 className='size-4' />
          </TooltipButton>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;