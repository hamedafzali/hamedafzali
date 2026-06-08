import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import ApiService, { ProfileData, Skill } from "../services/api";

export interface FooterData {
  copyright: string;
  navigationLinks: { name: string; href: string }[];
  socialLinks: { name: string; href: string; text: string }[];
}

interface PortfolioData {
  profile: ProfileData | null;
  skills: Skill[];
  footer: FooterData | null;
}

const PortfolioDataContext = createContext<PortfolioData>({
  profile: null,
  skills: [],
  footer: null,
});

export const usePortfolioData = (): PortfolioData =>
  useContext(PortfolioDataContext);

// Fetches the shared, cross-section data (profile, skills, footer) once for
// the whole app instead of each component fetching it independently.
export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [footer, setFooter] = useState<FooterData | null>(null);

  useEffect(() => {
    let active = true;
    ApiService.getProfile()
      .then((d) => active && setProfile(d))
      .catch(() => active && setProfile(null));
    ApiService.getSkills()
      .then((d) => active && setSkills(d))
      .catch(() => active && setSkills([]));
    ApiService.getFooter()
      .then((d) => active && setFooter(d))
      .catch(() => active && setFooter(null));
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortfolioDataContext.Provider value={{ profile, skills, footer }}>
      {children}
    </PortfolioDataContext.Provider>
  );
};
