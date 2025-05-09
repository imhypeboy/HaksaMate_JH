'use client';


export default function Page() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<Subject>({
    name: '',
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
  });


  useEffect(() => {
    loadSubjects();
  }, []);

    await createSubject(form);
    await loadSubjects();
  };

  return (
        <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <select
            value={form.dayOfWeek}
        >
          ))}
        </select>
            value={form.startTime}
            value={form.endTime}
            onChange={e => setForm({ ...form, endTime: e.target.value })}
        <input
        />
      </div>
  );
}