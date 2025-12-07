export interface Badge {

    id: string;
    xp: number;
    title: string;
    imageUrl?: string; // Optional URL for Firebase Storage image
}

export const BADGES: Badge[] = [
    {
        id: "badge-50",
        xp: 50,
        title: "50 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b10.png?alt=media&token=273f79bd-32f7-4966-aaa1-f8d8711baea2"
    },
    {
        id: "badge-100",
        xp: 100,
        title: "100 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b12.png?alt=media&token=957aab3b-6ef5-42bc-842c-441cf898b840"
    },
    {
        id: "badge-150",
        xp: 150,
        title: "150 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b11.png?alt=media&token=8357fcf9-c4fa-4ca0-b7bd-934b25acba25"
    },
    {
        id: "badge-200",
        xp: 200,
        title: "200 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b19.png?alt=media&token=8b274c38-bef3-41cd-b32a-bd860cb3ec4e"
    },
    {
        id: "badge-250",
        xp: 250,
        title: "250 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b9.png?alt=media&token=0c1734f5-3250-4bdf-a292-99250bf0d395"
    },
    {
        id: "badge-300",
        xp: 300,
        title: "300 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b8.png?alt=media&token=885cfdcd-c3fa-4034-8f3a-96d72f8a422c"
    },
    {
        id: "badge-350",
        xp: 350,
        title: "350 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b2.png?alt=media&token=7fa99d6f-80cb-4ff3-be9f-3718711e8689"
    },
    {
        id: "badge-400",
        xp: 400,
        title: "400 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b15.png?alt=media&token=3b43ad9a-739a-437b-b336-cda674d651ea"
    },
    {
        id: "badge-450",
        xp: 450,
        title: "450 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b21.png?alt=media&token=67d34edc-c911-4f29-a911-43652102ac18"
    },
    {
        id: "badge-500",
        xp: 500,
        title: "500 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/handyBalckRaw.png?alt=media&token=817fe28e-752d-4680-8430-7c541901f8d7"
    },
    {
        id: "badge-550",
        xp: 550,
        title: "550 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b17.png?alt=media&token=242bc42e-6b90-4167-9b23-c576062f95a4"
    },
    {
        id: "badge-600",
        xp: 600,
        title: "600 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b22.png?alt=media&token=69253778-0717-4514-838c-9a39fd19ee96"
    },
    {
        id: "badge-650",
        xp: 650,
        title: "650 XP Badge",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b20.png?alt=media&token=88c450b1-5a09-4ffb-9408-65ec22dd00f8"
    }
];

export const getBadgeByXP = (xp: number) => BADGES.find(b => b.xp === xp);
export const getNextBadge = (currentXP: number) => BADGES.find(b => b.xp > currentXP);
