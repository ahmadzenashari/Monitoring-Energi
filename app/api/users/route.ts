import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    // Ambil token dari request
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const idToken = authorization.split("Bearer ")[1];

    // Verifikasi user yang sedang login
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Cek role user yang sedang login
    const currentUserDoc = await adminDb
      .collection("Users")
      .doc(decodedToken.uid)
      .get();

    if (!currentUserDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengguna tidak ditemukan.",
        },
        { status: 403 }
      );
    }

    const currentUserData = currentUserDoc.data();

    if (
      currentUserData?.role?.toLowerCase() !== "administrator"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Administrator yang dapat menambahkan akun.",
        },
        { status: 403 }
      );
    }

    // Ambil data dari request
    const body = await request.json();

    const {
      name,
      email,
      password,
      role,
      status,
    } = body;

    // Validasi
    if (!name || !email || !password || !role || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field harus diisi.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    // 1. Buat user di Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Simpan profile user di Firestore
    await adminDb
      .collection("Users")
      .doc(userRecord.uid)
      .set({
        name,
        email,
        role,
        status,
        createdAt: new Date(),
      });

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat.",
        user: {
          uid: userRecord.uid,
          name,
          email,
          role,
          status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create user error:", error);

    if (error?.code === "auth/email-already-exists") {
      return NextResponse.json(
        {
          success: false,
          message: "Email tersebut sudah terdaftar.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal membuat akun.",
      },
      { status: 500 }
    );
  }
}