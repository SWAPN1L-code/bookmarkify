import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    to: string;
    active?: boolean;
}

export function SidebarItem({ icon: Icon, label, to, active }: SidebarItemProps) {
    return (
        <Link to={to}>
            <Button
                variant={active ? 'secondary' : 'ghost'}
                className="w-full justify-start"
            >
                <Icon className="mr-2 h-4 w-4" />
                {label}
            </Button>
        </Link>
    );
}
