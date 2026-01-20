import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create System User
    const systemUser = await prisma.user.upsert({
        where: { clerkId: 'system_admin' },
        update: {},
        create: {
            clerkId: 'system_admin',
            handle: 'System',
            email: 'admin@ai-ui-generator.com',
            avatarUrl: 'https://github.com/shadcn.png'
        },
    });

    console.log('👤 System user ready');

    // 2. Define Golden Samples
    const samples = [
        {
            prompt: "Modern Login Screen",
            style: "modern",
            dsl: {
                type: "container",
                props: {
                    style: {
                        background: "gradient-subtle",
                        className: "min-h-[400px] flex items-center justify-center"
                    },
                    padding: "xl"
                },
                children: [
                    {
                        type: "card",
                        props: {
                            title: "Welcome Back",
                            description: "Enter your credentials to access your account",
                            variant: "glass",
                            style: {
                                className: "w-full max-w-md"
                            }
                        },
                        children: [
                            {
                                type: "container",
                                props: { gap: "md", direction: "vertical" },
                                children: [
                                    {
                                        type: "input",
                                        props: { label: "Email", placeholder: "hello@example.com", type: "email" }
                                    },
                                    {
                                        type: "input",
                                        props: { label: "Password", placeholder: "••••••••", type: "password" }
                                    },
                                    {
                                        type: "button",
                                        props: { label: "Sign In", variant: "primary", size: "lg", style: { className: "w-full" } }
                                    },
                                    {
                                        type: "container",
                                        props: { justify: "center", padding: "sm" },
                                        children: [
                                            { type: "text", props: { value: "Don't have an account?", variant: "muted" } },
                                            { type: "text", props: { value: "Sign up", variant: "small", style: { className: "text-primary cursor-pointer hover:underline" } } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            prompt: "Analytics Dashboard Card",
            style: "modern",
            dsl: {
                type: "card",
                props: {
                    title: "Revenue Overview",
                    description: "Monthly revenue performance vs target",
                    padding: "lg",
                    variant: "elevated"
                },
                children: [
                    {
                        type: "container",
                        props: { direction: "horizontal", justify: "between", align: "end", className: "mb-6" },
                        children: [
                            {
                                type: "container",
                                children: [
                                    { type: "text", props: { value: "$45,231.89", variant: "h2" } },
                                    { type: "badge", props: { label: "+20.1% from last month", variant: "success" } }
                                ]
                            }
                        ]
                    },
                    {
                        type: "chart",
                        props: {
                            type: "area",
                            height: "240px",
                            xAxisKey: "month",
                            data: [
                                { month: "Jan", value: 2400 },
                                { month: "Feb", value: 1398 },
                                { month: "Mar", value: 9800 },
                                { month: "Apr", value: 3908 },
                                { month: "May", value: 4800 },
                                { month: "Jun", value: 3800 },
                                { month: "Jul", value: 4300 },
                            ],
                            series: [{ key: "value", color: "#8b5cf6", name: "Revenue" }]
                        }
                    }
                ]
            }
        },
        {
            prompt: "Pricing Plans",
            style: "modern",
            dsl: {
                type: "container",
                props: { cols: 3, gap: "lg" },
                children: [
                    {
                        type: "card",
                        props: { title: "Starter", description: "For hobbyists", variant: "flat", style: { className: "relative overflow-hidden" } },
                        children: [
                            { type: "text", props: { value: "$0", variant: "h1" } },
                            { type: "text", props: { value: "/month", variant: "muted" } },
                            { type: "separator", props: { orientation: "horizontal" } },
                            { type: "text", props: { value: "✓ 1 User", variant: "small" } },
                            { type: "text", props: { value: "✓ 5 Projects", variant: "small" } },
                            { type: "button", props: { label: "Get Started", variant: "outline", style: { className: "w-full mt-4" } } }
                        ]
                    },
                    {
                        type: "card",
                        props: { title: "Pro", description: "For professionals", variant: "elevated", style: { className: "border-primary border-2 relative" } },
                        children: [
                            { type: "badge", props: { label: "Popular", variant: "default", style: { className: "absolute top-4 right-4" } } },
                            { type: "text", props: { value: "$29", variant: "h1" } },
                            { type: "text", props: { value: "/month", variant: "muted" } },
                            { type: "separator", props: { orientation: "horizontal" } },
                            { type: "text", props: { value: "✓ Unlimited Users", variant: "small" } },
                            { type: "text", props: { value: "✓ Unlimited Projects", variant: "small" } },
                            { type: "text", props: { value: "✓ Priority Support", variant: "small" } },
                            { type: "button", props: { label: "Upgrade Now", variant: "primary", style: { className: "w-full mt-4" } } }
                        ]
                    },
                    {
                        type: "card",
                        props: { title: "Enterprise", description: "For large teams", variant: "flat" },
                        children: [
                            { type: "text", props: { value: "Custom", variant: "h1" } },
                            { type: "text", props: { value: "contact us", variant: "muted" } },
                            { type: "separator", props: { orientation: "horizontal" } },
                            { type: "text", props: { value: "✓ SSO & Security", variant: "small" } },
                            { type: "text", props: { value: "✓ Dedicated Account Manager", variant: "small" } },
                            { type: "button", props: { label: "Contact Sales", variant: "ghost", style: { className: "w-full mt-4" } } }
                        ]
                    }
                ]
            }
        }
    ];

    // 3. Insert Samples
    for (const sample of samples) {
        await prisma.post.create({
            data: {
                ...sample,
                userId: systemUser.id,
                dsl: sample.dsl as any
            }
        });
    }

    console.log(`✅ Seeded ${samples.length} posts successfully`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
