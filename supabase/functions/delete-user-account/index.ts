import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteAccountRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      console.error("Missing environment variables:", {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceRoleKey: !!supabaseServiceRoleKey,
        supabaseAnonKey: !!supabaseAnonKey
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { userId }: DeleteAccountRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user authentication header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the user is authenticated and can only delete their own account
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Can only delete your own account" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Delete user profile data first (due to foreign key constraints)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to delete profile data" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Delete the user account from auth
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (userError) {
      console.error("Error deleting user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user account" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`User account ${userId} deleted successfully`);

    return new Response(
      JSON.stringify({ message: "Account deleted successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-user-account function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);