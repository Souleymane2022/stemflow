import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const categoryOptions = [
    { value: "science", label: "Science" },
    { value: "technology", label: "Technologie" },
    { value: "engineering", label: "Ingénierie" },
    { value: "mathematics", label: "Mathématiques" },
];

export function CreateRoomDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("technology");
    const [type, setType] = useState("public");

    const createRoomMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/rooms", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
            toast({
                title: "Salon créé !",
                description: "Ton nouveau salon est désormais accessible à toute la communauté.",
            });
            setOpen(false);
            setName("");
            setDescription("");
        },
        onError: () => {
            toast({
                title: "Erreur",
                description: "Impossible de créer ce salon pour le moment.",
                variant: "destructive"
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) return;

        createRoomMutation.mutate({
            name,
            description,
            category,
            type
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-panel premium-shadow border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-accent" />
                        Créer un nouveau salon
                    </DialogTitle>
                    <DialogDescription>
                        Rassemble la communauté autour d'un sujet qui te passionne.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nom du salon</label>
                        <Input
                            placeholder="Ex: Passionnés d'Aérospatial 🚀"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="De quoi allez-vous discuter ici ?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Catégorie</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categoryOptions.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Visibilité</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="public">🌍 Public (Ouvert)</option>
                                <option value="private">🔒 Privé (Invitation)</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            className="w-full interactive-element hover-elevate gradient-stem text-white"
                            disabled={createRoomMutation.isPending || !name.trim() || !description.trim()}
                        >
                            {createRoomMutation.isPending ? "Création en cours..." : "Lancer le salon"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
