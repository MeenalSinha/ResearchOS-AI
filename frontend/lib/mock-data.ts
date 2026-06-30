export const MOCK_TOKEN = "fake.eyJzdWIiOiAiZGVtby11c2VyLTEyMyIsICJlbWFpbCI6ICJkZW1vQHJlc2VhcmNob3MuY29tIiwgImZ1bGxfbmFtZSI6ICJEZW1vIFVzZXIifQ.fake";

export const isDemoUser = (token: string | null) => {
  return token === MOCK_TOKEN;
};

export const getMockData = async (path: string, options: RequestInit = {}): Promise<any> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 500));

  if (path === "/dashboard/summary") {
    return {
      applications_sent: 12,
      responses: 5,
      response_rate: 41.6,
      interviews: 2,
      acceptance_rate: 16.6,
      average_match_score: 92.5,
    };
  }

  if (path === "/applications/pipeline-summary") {
    return {
      draft: 2,
      ready: 1,
      submitted: 4,
      under_review: 3,
      viewed: 2,
      replied: 1,
      interview: 2,
      accepted: 0,
      rejected: 2,
    };
  }

  if (path === "/dashboard/recommendations") {
    return [
      {
        university: "MIT",
        professor: "Prof. Antonio Torralba",
        field: "Computer Vision",
        match: 95,
        recommendation: "Highly Recommended",
        imageSrc: "/images/prof_antonio.png",
      },
      {
        university: "Stanford University",
        professor: "Prof. Fei-Fei Li",
        field: "Computer Science",
        match: 92,
        recommendation: "Strong Match",
        imageSrc: "/images/prof_fei_fei.png",
      },
      {
        university: "Carnegie Mellon University",
        professor: "Prof. Martial Hebert",
        field: "Robotics Institute",
        match: 88,
        recommendation: "Good Match",
        imageSrc: "/images/prof_martial.png",
      },
    ];
  }

  if (path === "/dashboard/tasks") {
    return [
      {
        icon: "file",
        title: "Complete draft for Prof. Antonio Torralba",
        due: "Action required"
      },
      {
        icon: "calendar",
        title: "Interview with Prof. Fei-Fei Li",
        due: "Action required"
      }
    ];
  }

  if (path === "/agents/profile") {
    // This is the endpoint that fails during Professor Discovery
    return {
      success: true,
      data: {
        draft_id: "mock-draft-123",
        message: "Mock discovery complete!",
      }
    };
  }

  if (path === "/applications") {
    return [
      { id: "1", status: "ready", title: "Prof. Antonio Torralba - MIT", approved: false },
      { id: "2", status: "submitted", title: "Prof. Fei-Fei Li - Stanford", approved: true },
      { id: "3", status: "under_review", title: "Prof. Martial Hebert - CMU", approved: true },
    ];
  }

  if (path === "/messages") {
    return [
      {
        id: "1", application_id: "2", professor_id: "p2", professor_name: "Prof. Fei-Fei Li",
        professor_image: "/images/prof_fei_fei.png", direction: "inbound",
        subject: "Re: PhD Application - Computer Vision",
        body_text: "Thank you for reaching out. I was very impressed by your background. Would you be available for a quick chat next Tuesday?",
        is_read: false, timestamp: new Date().toISOString()
      }
    ];
  }

  if (path === "/calendar/events") {
    return [
      { id: "1", application_id: "2", title: "Interview with Prof. Fei-Fei Li", date: new Date(Date.now() + 86400000 * 2).toISOString(), event_type: "follow_up", status: "scheduled" }
    ];
  }

  if (path === "/pipeline/opportunities/scan") {
    return {
      source: "Web Search",
      note: "Scanned MITACS, DAAD, and SURGE listings. Found 2 potential matches for Summer 2027 intake in Computer Vision.",
      fields: ["Computer Vision", "Robotics"]
    };
  }

  if (path === "/interviews") {
    return [
      { id: "1", professor_name: "Prof. Fei-Fei Li", date: new Date(Date.now() + 86400000 * 2).toISOString(), status: "scheduled", link: "https://zoom.us/j/123456789" }
    ];
  }

  if (path === "/documents") {
    return [
      { id: "1", name: "Resume_2026.pdf", type: "resume", uploaded_at: new Date().toISOString() },
      { id: "2", name: "SOP_Draft_v2.docx", type: "sop", uploaded_at: new Date().toISOString() },
    ];
  }

  if (path === "/graph") {
    return {
      nodes: [{ id: "n1", label: "Computer Vision" }, { id: "n2", label: "Robotics" }],
      edges: [{ source: "n1", target: "n2" }]
    };
  }

  if (path === "/applications/candidates") {
    return [
      { name: "Stanford AI Lab", score: 92 },
      { name: "MIT CSAIL", score: 95 }
    ];
  }

  if (path === "/pipeline/strategy") {
    return { recommendation: "Focus heavily on Computer Vision labs this cycle.", confidence: 85 };
  }

  // Fallback empty response for other endpoints
  if (options.method === "POST" || options.method === "PUT") {
    return { success: true };
  }
  return [];
};
