import type * as React from 'react';

export type Seat = 'K' | 'D' | 'G' | 'B';
export type SuitCode = 'S' | 'H' | 'D' | 'C';
export type Strain = 'C' | 'D' | 'H' | 'S' | 'NT';
export type Vuln = 'none' | 'KG' | 'DB' | 'all';
/** Cards per suit as space-separated ranks, e.g. "A K 10 5"; "" = void. */
export type HandCards = { S?: string; H?: string; D?: string; C?: string };
/** Highest makeable level 1–7 per strain, or null when nothing makes. */
export type DDRow = Partial<Record<Strain, number | null>>;

export interface TopBarProps { active?: 'atolye' | 'setler' | string; links?: { id: string; label: string; href: string }[]; homeHref?: string; end?: React.ReactNode }
export declare function TopBar(props: TopBarProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; size?: 'md' | 'sm'; busy?: boolean; busyLabel?: React.ReactNode }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface FieldProps { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; id?: string; className?: string; children: React.ReactElement }
export declare function Field(props: FieldProps): React.ReactElement;
export declare function Input(props: React.InputHTMLAttributes<HTMLInputElement>): React.ReactElement;
export declare function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>): React.ReactElement;

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { label: React.ReactNode }
export declare function Checkbox(props: CheckboxProps): React.ReactElement;

export interface TagProps { tone?: 'neutral' | 'note' | 'archived' | 'vuln'; children?: React.ReactNode; className?: string }
export declare function Tag(props: TagProps): React.ReactElement;

export interface NoticeProps { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; className?: string }
export declare function Notice(props: NoticeProps): React.ReactElement;

export interface ProgressProps { value: number; max?: number; label?: string }
export declare function Progress(props: ProgressProps): React.ReactElement;

export interface DialogProps { title: string; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; onClose?: () => void; size?: 'md' | 'lg'; inline?: boolean }
export declare function Dialog(props: DialogProps): React.ReactElement;

export interface SuitProps { suit: SuitCode; size?: number | string; className?: string }
export declare function Suit(props: SuitProps): React.ReactElement;

export interface HandProps { seat: Seat; hp?: number; cards?: HandCards; hidden?: boolean; size?: 'md' | 'lg'; className?: string }
export declare function Hand(props: HandProps): React.ReactElement;

export interface BoardBoxProps { number: number; dealer: Seat; vuln?: Vuln; size?: 'md' | 'lg'; className?: string }
export declare function BoardBox(props: BoardBoxProps): React.ReactElement;

export interface DDTableProps { rows?: Partial<Record<Seat, DDRow>>; par?: { strain: Strain; seats: Seat[] }; parText?: React.ReactNode; analyzing?: boolean; size?: 'md' | 'lg'; className?: string }
export declare function DDTable(props: DDTableProps): React.ReactElement;

export interface BoardCardProps { number: number; dealer: Seat; vuln?: Vuln; hands: Partial<Record<Seat, HandCards>>; hp?: Partial<Record<Seat, number>>; dd?: Partial<Record<Seat, DDRow>>; par?: { strain: Strain; seats: Seat[] }; parText?: React.ReactNode; analyzing?: boolean; hasNote?: boolean; studentMode?: boolean; subjectSeats?: Seat[]; onOpen?: () => void; className?: string }
export declare function BoardCard(props: BoardCardProps): React.ReactElement;

export interface SetItemProps { title: string; href?: string; meta: React.ReactNode; note?: string; archived?: boolean; onOpen?: () => void; onCopy?: () => void; onArchive?: () => void; onDelete?: () => void; className?: string }
export declare function SetItem(props: SetItemProps): React.ReactElement;

declare global {
  interface Window {
    Brichane: {
      TopBar: typeof TopBar; Button: typeof Button; Field: typeof Field; Input: typeof Input; Select: typeof Select;
      Checkbox: typeof Checkbox; Tag: typeof Tag; Notice: typeof Notice; Progress: typeof Progress; Dialog: typeof Dialog;
      Suit: typeof Suit; Hand: typeof Hand; BoardBox: typeof BoardBox; DDTable: typeof DDTable; BoardCard: typeof BoardCard; SetItem: typeof SetItem;
      SEAT_NAMES: Record<Seat, string>; VULN_TEXT: Record<Vuln, string>;
    };
  }
}
