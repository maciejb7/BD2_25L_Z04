import request from "supertest";
import { getLoggedUserData } from "../../utils/userHelpers";
import { getApp } from "../../setup";
import { User } from "../../../db/models/user";
//import { Question } from "../db/models/question";
//import { Answer } from "../db/models/answer";

describe("Question API", () => {
  describe("GET /api/questions", () => {
    it("should get all questions successfully for authenticated user", async () => {
      const { accessToken } = await getLoggedUserData(
        "Aleksandra",
        "aleksandra1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .get("/api/questions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("content");
      expect(response.body[0]).toHaveProperty("is_active");

      await User.destroy({ where: { nickname: "Aleksandra" } });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(await getApp()).get("/api/questions");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
    });
  });

  describe("POST /api/questions/answer", () => {
    it("should save answer successfully", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Bartosz",
        "bartosz1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q1",
          answer: "Lubię czytać książki i oglądać filmy",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("userId", user.userId);
      expect(response.body).toHaveProperty("questionId", "q1");
      expect(response.body).toHaveProperty(
        "answer",
        "Lubię czytać książki i oglądać filmy",
      );

      await User.destroy({ where: { nickname: "Bartosz" } });
    });

    it("should update existing answer", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Cecylia",
        "cecylia1990@gmail.com",
        "Haslo123@",
      );

      // First answer
      await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q2",
          answer: "Rano",
        });

      // Update answer
      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q2",
          answer: "Wieczór",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("answer", "Wieczór");

      await User.destroy({ where: { nickname: "Cecylia" } });
    });

    it("should return 400 for missing userId", async () => {
      const { accessToken } = await getLoggedUserData(
        "Damian",
        "damian1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          questionId: "q1",
          answer: "Moja odpowiedź",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Given Answer is missing data",
      );

      await User.destroy({ where: { nickname: "Damian" } });
    });

    it("should return 400 for missing questionId", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Elżbieta",
        "elzbieta1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          answer: "Moja odpowiedź",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Given Answer is missing data",
      );

      await User.destroy({ where: { nickname: "Elżbieta" } });
    });

    it("should return 400 for missing answer", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Filip",
        "filip1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q1",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Given Answer is missing data",
      );

      await User.destroy({ where: { nickname: "Filip" } });
    });

    it("should return 404 for non-existing user", async () => {
      const { accessToken } = await getLoggedUserData(
        "Gabriela",
        "gabriela1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: "non-existing-user-id",
          questionId: "q1",
          answer: "Moja odpowiedź",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("There is no user with id");

      await User.destroy({ where: { nickname: "Gabriela" } });
    });

    it("should return 404 for non-existing question", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Henryk",
        "henryk1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "non-existing-question",
          answer: "Moja odpowiedź",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("does not exist");

      await User.destroy({ where: { nickname: "Henryk" } });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(await getApp())
        .post("/api/questions/answer")
        .send({
          userId: "some-user-id",
          questionId: "q1",
          answer: "Moja odpowiedź",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
    });
  });

  describe("GET /api/questions/answers/user/:userId", () => {
    it("should get answers by user successfully", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Iwona",
        "iwona1990@gmail.com",
        "Haslo123@",
      );

      // Create an answer first
      await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q3",
          answer: "Fotografia i podróże",
        });

      const response = await request(await getApp())
        .get(`/api/questions/answers/user/${user.userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("userId", user.userId);
      expect(response.body[0]).toHaveProperty("user");
      expect(response.body[0]).toHaveProperty("question");

      await User.destroy({ where: { nickname: "Iwona" } });
    });

    it("should return 404 when user has no answers", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Jakub",
        "jakub1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .get(`/api/questions/answers/user/${user.userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("No answer for user with id");

      await User.destroy({ where: { nickname: "Jakub" } });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(await getApp()).get(
        "/api/questions/answers/user/some-user-id",
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
    });
  });

  describe("GET /api/questions/answers/question/:questionId", () => {
    it("should get answers by question successfully", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Katarzyna",
        "katarzyna1990@gmail.com",
        "Haslo123@",
      );

      // Create an answer first
      await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q4",
          answer: "Komedie romantyczne",
        });

      const response = await request(await getApp())
        .get("/api/questions/answers/question/q4")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("questionId", "q4");
      expect(response.body[0]).toHaveProperty("user");
      expect(response.body[0]).toHaveProperty("question");

      await User.destroy({ where: { nickname: "Katarzyna" } });
    });

    it("should return 404 when question has no answers", async () => {
      const { accessToken } = await getLoggedUserData(
        "Łukasz",
        "lukasz1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .get("/api/questions/answers/question/q10")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("No answer for question with id");

      await User.destroy({ where: { nickname: "Łukasz" } });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(await getApp()).get(
        "/api/questions/answers/question/q1",
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
    });
  });

  describe("GET /api/questions/answers", () => {
    it("should get all answers successfully when answers exist", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Magdalena",
        "magdalena1990@gmail.com",
        "Haslo123@",
      );

      // Create an answer first
      await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q5",
          answer: "Pizza i sushi",
        });

      const response = await request(await getApp())
        .get("/api/questions/answers")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("user");
      expect(response.body[0]).toHaveProperty("question");

      await User.destroy({ where: { nickname: "Magdalena" } });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(await getApp()).get(
        "/api/questions/answers",
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
    });
  });

  describe("POST /api/questions/user-answers-for-questions", () => {
    it("should get current user answers for specific questions", async () => {
      const { user, accessToken } = await getLoggedUserData(
        "Norbert",
        "norbert1990@gmail.com",
        "Haslo123@",
      );

      // Create some answers first
      await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q6",
          answer: "Lato",
        });

      await request(await getApp())
        .post("/api/questions/answer")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: user.userId,
          questionId: "q7",
          answer: "Kawa",
        });

      const response = await request(await getApp())
        .post("/api/questions/user-answers-for-questions")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          questionIds: ["q6", "q7"],
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(
        response.body.some(
          (answer: { questionId: string }) => answer.questionId === "q6",
        ),
      ).toBe(true);
      expect(
        response.body.some(
          (answer: { questionId: string }) => answer.questionId === "q7",
        ),
      ).toBe(true);

      await User.destroy({ where: { nickname: "Norbert" } });
    });

    it("should return empty array when user has no answers for specified questions", async () => {
      const { accessToken } = await getLoggedUserData(
        "Olga",
        "olga1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/user-answers-for-questions")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          questionIds: ["q8", "q9"],
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      await User.destroy({ where: { nickname: "Olga" } });
    });

    it("should return 400 for invalid questionIds format", async () => {
      const { accessToken } = await getLoggedUserData(
        "Patryk",
        "patryk1990@gmail.com",
        "Haslo123@",
      );

      const response = await request(await getApp())
        .post("/api/questions/user-answers-for-questions")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          questionIds: "not-an-array",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "questionIds must be an array",
      );

      await User.destroy({ where: { nickname: "Patryk" } });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(await getApp())
        .post("/api/questions/user-answers-for-questions")
        .send({
          questionIds: ["q1", "q2"],
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
    });
  });

  // Clean up any remaining test data
  afterAll(async () => {
    // Clean up any test users that might have been left behind
    const testNicknames = [
      "Aleksandra",
      "Bartosz",
      "Cecylia",
      "Damian",
      "Elżbieta",
      "Filip",
      "Gabriela",
      "Henryk",
      "Iwona",
      "Jakub",
      "Katarzyna",
      "Łukasz",
      "Magdalena",
      "Norbert",
      "Olga",
      "Patryk",
    ];

    for (const nickname of testNicknames) {
      try {
        await User.destroy({ where: { nickname } });
      } catch (error) {
        // Ignore errors - user might not exist
      }
    }
  });
});
