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
        imageSrc: "https://i.pravatar.cc/150?u=torralba",
      },
      {
        university: "Stanford University",
        professor: "Prof. Fei-Fei Li",
        field: "Computer Science",
        match: 92,
        recommendation: "Strong Match",
        imageSrc: "https://i.pravatar.cc/150?u=feifei",
      },
      {
        university: "Carnegie Mellon University",
        professor: "Prof. Martial Hebert",
        field: "Robotics Institute",
        match: 88,
        recommendation: "Good Match",
        imageSrc: "https://i.pravatar.cc/150?u=hebert",
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

  // Fallback empty response for other endpoints
  if (options.method === "POST" || options.method === "PUT") {
    return { success: true };
  }
  return [];
};
