'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/Dropdown';
import { LucideIcon, Dot, Monitor, Moon, Sun } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';

interface DropdownItemProps {
  newTheme: string;
  label: string;
  Icon: LucideIcon;
}

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const ThemeItem = ({ newTheme, Icon, label }: DropdownItemProps) => (
    <DropdownItem onClick={() => setTheme(newTheme)} aria-label={`${ label } 테마 선택`}>
      <div className='flex w-full items-center justify-between'>
        <div className='p-2 flex items-center gap-2'>
          <Icon width={14} />
          {label}
        </div>
        {theme === newTheme && <Dot className='text-end' />}
      </div>
    </DropdownItem>
  );

  return (
    <Dropdown>
      <TooltipButton tooltip='테마' ariaLabel='테마 변경'>
        <DropdownTrigger>
          <div className='flex rounded-md p-2 hover:bg-background-secondary cursor-pointer'>
            <Sun className='size-4 text-main dark:hidden' />
            <Moon className='size-4 text-main hidden dark:block' />
          </div>
        </DropdownTrigger>
      </TooltipButton>
      <DropdownList align='end'>
        <ThemeItem newTheme='light' label='Light' Icon={Sun} />
        <ThemeItem newTheme='dark' label='Dark' Icon={Moon} />
        <ThemeItem newTheme='system' label='System' Icon={Monitor} />
      </DropdownList>
    </Dropdown>
  );
};

export default ThemeSwitch;
