import styled from 'styled-components';
import { FaYoutube } from 'react-icons/fa';
import { FormGroup, Label, HelpText } from '../ui/FormGroup';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LinkRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ReorderButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const ReorderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1rem;
  padding: 0;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 3px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  font-size: 0.6rem;
  line-height: 1;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

// links: string[], onChange: (newLinks: string[]) => void
export default function YoutubeLinksField({ links, onChange }) {
  const { t } = useTranslation();
  const updateLink = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    onChange(newLinks);
  };

  const addLink = () => {
    onChange([...links, '']);
  };

  const removeLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    onChange(newLinks.length > 0 ? newLinks : ['']);
  };

  const moveLink = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= links.length) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    onChange(newLinks);
  };

  return (
    <FormGroup>
      <Label><FaYoutube size={16} color="#FF0000" />{t('cheatSheetForm.youtube.label')}</Label>
      <LinksContainer>
        {links.map((link, index) => (
          <LinkRow key={index}>
            {links.length > 1 && (
              <ReorderButtons>
                <ReorderButton
                  type="button"
                  onClick={() => moveLink(index, -1)}
                  disabled={index === 0}
                  aria-label={t('cheatSheetForm.youtube.moveUp')}
                  title={t('cheatSheetForm.youtube.moveUp')}
                >
                  ▲
                </ReorderButton>
                <ReorderButton
                  type="button"
                  onClick={() => moveLink(index, 1)}
                  disabled={index === links.length - 1}
                  aria-label={t('cheatSheetForm.youtube.moveDown')}
                  title={t('cheatSheetForm.youtube.moveDown')}
                >
                  ▼
                </ReorderButton>
              </ReorderButtons>
            )}
            <Input
              type="url"
              placeholder={t('cheatSheetForm.youtube.placeholder')}
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
            />
            {(links.length > 1 || link.trim() !== '') && (
              <Button type="button" $variant="danger" $size="sm" onClick={() => removeLink(index)}>
                {t('cheatSheetForm.remove')}
              </Button>
            )}
          </LinkRow>
        ))}
        <Button type="button" $variant="secondary" $size="sm" onClick={addLink} style={{ alignSelf: 'flex-start' }}>
          {t('cheatSheetForm.youtube.add')}
        </Button>
      </LinksContainer>
      <HelpText>
        {t('cheatSheetForm.youtube.help')}
      </HelpText>
    </FormGroup>
  );
}
