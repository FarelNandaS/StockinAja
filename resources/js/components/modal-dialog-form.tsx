import type { ReactNode, SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from './ui/spinner';

type props = {
    buttonIcon?: ReactNode;
    buttonText?: string;
    title?: string;
    description?: string;
    children?: ReactNode;
    btnTextSave?: string;
    onSubmit?: (event: SyntheticEvent<HTMLFormElement>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    isSubmitting?: boolean;
    className?: string;
};

export function ModalDialog({
    buttonIcon,
    buttonText,
    title,
    description,
    children,
    btnTextSave,
    onSubmit,
    open,
    onOpenChange,
    isSubmitting,
    className,
}: props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className={className}>
                    {buttonIcon}
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {children}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    Submitting...
                                </>
                            ) : (
                                btnTextSave
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
