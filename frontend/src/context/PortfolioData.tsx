import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import ApiService, { ChatStatus, ProfileData, Skill } from "../services/api";

export interface FooterData {
  copyright: string;
  navigationLinks: { name: string; href: string }[];
  socialLinks: { name: string; href: string; text: string }[];
}

interface PortfolioData {
  profile: ProfileData | null;
  skills: Skill[];
  footer: FooterData | null;
  chat: ChatStatus | null;
}

const PortfolioDataContext = createContext<PortfolioData>({
  profile: null,
  skills: [],
  footer: null,
  chat: null,
});

// Any component can open the chat panel without holding a ref to it.
export const OPEN_CHAT_EVENT = "portfolio:open-chat";
export const openChat = () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT));

export const usePortfolioData = (): PortfolioData =>
  useContext(PortfolioDataContext);

// Fetches the shared, cross-section data (profile, skills, footer, chat) once for
// the whole app instead of each component fetching it independently.
export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [chat, setChat] = useState<ChatStatus | null>(null);

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
    ApiService.getChatStatus().then((d) => active && setChat(d));
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortfolioDataContext.Provider value={{ profile, skills, footer, chat }}>
      {children}
    </PortfolioDataContext.Provider>
  );
};
