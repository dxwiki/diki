import { getProfileData } from '@/utils/profilesData';
import { Profile } from '@/types';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';

const ContactPage = async () => {
  const profile = await getProfileData();

  return (
    <div className="min-h-screen py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold text-main mb-8">
        {'Contact Us\r'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.map((p: Profile) => (
          <div
            key={p.id}
            className="shadow-md rounded-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105"
          >
            <div className="size-16 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-blue-500" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-main mb-2">
              {p.name}
            </h2>
            <p className="text-sm text-main mb-4">{p.email}</p>
            <div className="flex space-x-4">
              <a
                href={`https://github.com/${ p.social.github }`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:text-main transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href={`https://linkedin.com/in/${ p.social.linkedin }`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-900 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={`https://twitter.com/${ p.social.twitter }`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactPage;
