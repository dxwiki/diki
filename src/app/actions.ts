'use server';

import fs from 'fs';
import path from 'path';
import { TermData, Profile } from '@/types';

export async function getServerTermsData(): Promise<TermData[]> {
  try {
    const termsPath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    if (fs.existsSync(termsPath)) {
      const content = fs.readFileSync(termsPath, 'utf8');
      const terms = JSON.parse(content);
      return terms.filter((term: TermData) => term.publish !== false);
    }
    return [];
  } catch (error) {
    console.error('Error loading terms data:', error);
    return [];
  }
}

export async function getServerProfilesData(): Promise<Profile[]> {
  try {
    const profilesPath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
    if (fs.existsSync(profilesPath)) {
      const content = fs.readFileSync(profilesPath, 'utf8');
      return JSON.parse(content);
    }
    return [];
  } catch (error) {
    console.error('Error loading profiles data:', error);
    return [];
  }
}