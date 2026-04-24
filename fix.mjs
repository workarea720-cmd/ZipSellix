import fs from 'fs';
const content = fs.readFileSync('src/app/settings/SettingsClient.tsx', 'utf8');

const startIndex = content.indexOf('    const FinancialsTab = () => {');
const endIndex = content.indexOf('    // ── Tab 5: Documents');

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find FinancialsTab bounds');
    process.exit(1);
}

const replacement = `    const FinancialsTab = () => {
        const store = useBusinessStore();
        const { data: session } = useSession();
        const router = useRouter();
        const [saving, setSaving] = useState(false);
        const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm({
            defaultValues: {
                hosting: store.expenses.hosting,
                internet: store.expenses.internet,
                rent: store.expenses.rent,
                salary: store.expenses.salary,
            },
        });
        const [pkgSaving, setPkgSaving] = useState(false);
        const [pkg, setPkg] = useState(store.expenses.packagingCost);

        useEffect(() => {
            reset({ hosting: store.expenses.hosting, internet: store.expenses.internet, rent: store.expenses.rent, salary: store.expenses.salary });
            setPkg(store.expenses.packagingCost);
        }, [store.expenses]);

        const watchedValues = watch();
        const total = Number(watchedValues.hosting || 0) + Number(watchedValues.internet || 0) + Number(watchedValues.rent || 0) + Number(watchedValues.salary || 0);

        const onSaveExpenses = handleSubmit(async (data) => {
            setSaving(true);
            store.setExpenses({
                hosting: Number(data.hosting),
                internet: Number(data.internet),
                rent: Number(data.rent),
                salary: Number(data.salary),
            });
            await store.saveProfile();
            await new Promise(r => setTimeout(r, 600));
            setSaving(false);
            toast.success('Fixed expenses updated');
        });

        const onSavePkg = async () => {
            setPkgSaving(true);
            store.setExpenses({ packagingCost: Number(pkg) });
            await store.saveProfile();
            await new Promise(r => setTimeout(r, 600));
            setPkgSaving(false);
            toast.success('Packaging cost updated');
        };

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <SettingsCard title="Fixed Monthly Expenses" description="These costs are distributed across your profit calculations."
                    footer={<SaveButton onClick={onSaveExpenses} saving={saving} disabled={!isDirty} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                        {[
                            { label: 'Hosting', key: 'hosting' as const },
                            { label: 'Internet', key: 'internet' as const },
                            { label: 'Rent / Ads', key: 'rent' as const },
                            { label: 'Salaries', key: 'salary' as const },
                        ].map(item => (
                            <div key={item.key} className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">{item.label}</label>
                                <input type="number" {...register(item.key, { valueAsNumber: true })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary hover:bg-slate-100 transition-all duration-200" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between max-w-lg">
                        <span className="text-sm font-semibold text-slate-500">Total Fixed Monthly</span>
                        <span className="text-sm font-bold bg-brand-primary-light text-brand-primary px-3 py-1 rounded-md">Rs {total.toLocaleString()}</span>
                    </div>
                </SettingsCard>

                <SettingsCard title="Packaging Cost" description="Per-order packaging expense (box, tape, bubble wrap)."
                    footer={<SaveButton onClick={onSavePkg} saving={pkgSaving} disabled={pkg === store.expenses.packagingCost} />}>
                    <div className="max-w-xs space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Cost per Order (Rs)</label>
                        <input type="number" value={pkg} onChange={e => setPkg(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary hover:bg-slate-100 transition-all duration-200" />
                    </div>
                </SettingsCard>
            </div>
        );
    };

`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/app/settings/SettingsClient.tsx', newContent);
console.log('Fixed');
