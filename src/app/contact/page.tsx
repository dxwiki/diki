import { getProfileData } from '@/utils/profilesData';
import ContactClient from '@/components/common/ContactClient';

const ContactPage = async () => {
  const profile = await getProfileData();
  return (
    <ContactClient profile={profile} />
  );
};

export default ContactPage;
