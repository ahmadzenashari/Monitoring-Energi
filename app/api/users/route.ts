import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// =====================================================
// POST - TAMBAH AKUN
// =====================================================
export async function POST(request: NextRequest) {
  try {
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

    const decodedToken = await adminAuth.verifyIdToken(idToken);

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

    if (currentUserData?.role?.toLowerCase() !== "administrator") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Administrator yang dapat menambahkan akun.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      email,
      password,
      role,
      status,
    } = body;

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

    // Buat user di Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Simpan profile user di Firestore
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

// =====================================================
// PATCH - EDIT AKUN
// =====================================================
export async function PATCH(request: NextRequest) {
  try {
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

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Cek administrator
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

    if (currentUserData?.role?.toLowerCase() !== "administrator") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Administrator yang dapat mengubah akun.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      id,
      name,
      email,
      password,
      role,
      status,
    } = body;

    if (!id || !name || !email || !role || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Data akun tidak lengkap.",
        },
        { status: 400 }
      );
    }

    // Ambil user dari Firebase Authentication
    const userRecord = await adminAuth.getUser(id);

    // Update Authentication
    const authUpdate: {
      displayName: string;
      email: string;
      password?: string;
    } = {
      displayName: name,
      email: email,
    };

    // Password hanya diubah jika diisi
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password minimal 6 karakter.",
          },
          { status: 400 }
        );
      }

      authUpdate.password = password;
    }

    await adminAuth.updateUser(userRecord.uid, authUpdate);

    // Update Firestore
    await adminDb
      .collection("Users")
      .doc(id)
      .update({
        name,
        email,
        role,
        status,
        updatedAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diubah.",
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error?.code === "auth/email-already-exists") {
      return NextResponse.json(
        {
          success: false,
          message: "Email tersebut sudah digunakan.",
        },
        { status: 400 }
      );
    }

    if (error?.code === "auth/user-not-found") {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan di Firebase Authentication.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal mengubah akun.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - HAPUS AKUN
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
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

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Cek administrator
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

    if (currentUserData?.role?.toLowerCase() !== "administrator") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Administrator yang dapat menghapus akun.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID akun tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    // Jangan izinkan administrator menghapus dirinya sendiri
    if (id === decodedToken.uid) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak dapat menghapus akun sendiri.",
        },
        { status: 400 }
      );
    }

    // Hapus dari Firebase Authentication
    await adminAuth.deleteUser(id);

    // Hapus dari Firestore
    await adminDb
      .collection("Users")
      .doc(id)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);

    if (error?.code === "auth/user-not-found") {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan di Firebase Authentication.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal menghapus akun.",
      },
      { status: 500 }
    );
  }
}