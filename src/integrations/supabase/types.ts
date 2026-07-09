export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alchemy_components: {
        Row: {
          component_type: Database["public"]["Enums"]["alchemy_component_type"]
          dlc: boolean
          element: string | null
          id: string
          name: string
          notes: string | null
          slug: string
          source_item_id: string | null
          station: Database["public"]["Enums"]["alchemy_station"] | null
        }
        Insert: {
          component_type: Database["public"]["Enums"]["alchemy_component_type"]
          dlc?: boolean
          element?: string | null
          id?: string
          name: string
          notes?: string | null
          slug: string
          source_item_id?: string | null
          station?: Database["public"]["Enums"]["alchemy_station"] | null
        }
        Update: {
          component_type?: Database["public"]["Enums"]["alchemy_component_type"]
          dlc?: boolean
          element?: string | null
          id?: string
          name?: string
          notes?: string | null
          slug?: string
          source_item_id?: string | null
          station?: Database["public"]["Enums"]["alchemy_station"] | null
        }
        Relationships: [
          {
            foreignKeyName: "alchemy_components_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      alchemy_recipes: {
        Row: {
          dlc: boolean
          energy_cost: number
          id: string
          ingredients: Json
          name: string
          notes: string | null
          result_item_id: string | null
          slug: string
          station: Database["public"]["Enums"]["alchemy_station"]
        }
        Insert: {
          dlc?: boolean
          energy_cost?: number
          id?: string
          ingredients?: Json
          name: string
          notes?: string | null
          result_item_id?: string | null
          slug: string
          station: Database["public"]["Enums"]["alchemy_station"]
        }
        Update: {
          dlc?: boolean
          energy_cost?: number
          id?: string
          ingredients?: Json
          name?: string
          notes?: string | null
          result_item_id?: string | null
          slug?: string
          station?: Database["public"]["Enums"]["alchemy_station"]
        }
        Relationships: [
          {
            foreignKeyName: "alchemy_recipes_result_item_id_fkey"
            columns: ["result_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          base_buy_price: number | null
          base_sell_price: number | null
          category: string
          description: string | null
          dlc: boolean
          how_to_get: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          base_buy_price?: number | null
          base_sell_price?: number | null
          category: string
          description?: string | null
          dlc?: boolean
          how_to_get?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          base_buy_price?: number | null
          base_sell_price?: number | null
          category?: string
          description?: string | null
          dlc?: boolean
          how_to_get?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      npc: {
        Row: {
          day_available: Database["public"]["Enums"]["gk_day"] | null
          dlc: boolean
          id: string
          location: string | null
          name: string
          short_description: string | null
          slug: string
        }
        Insert: {
          day_available?: Database["public"]["Enums"]["gk_day"] | null
          dlc?: boolean
          id?: string
          location?: string | null
          name: string
          short_description?: string | null
          slug: string
        }
        Update: {
          day_available?: Database["public"]["Enums"]["gk_day"] | null
          dlc?: boolean
          id?: string
          location?: string | null
          name?: string
          short_description?: string | null
          slug?: string
        }
        Relationships: []
      }
      player_unlock_audit: {
        Row: {
          detail: string | null
          dlc: boolean
          id: string
          label: string
          profile_id: string
          section: Database["public"]["Enums"]["audit_section"]
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          detail?: string | null
          dlc?: boolean
          id?: string
          label: string
          profile_id: string
          section: Database["public"]["Enums"]["audit_section"]
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          detail?: string | null
          dlc?: boolean
          id?: string
          label?: string
          profile_id?: string
          section?: Database["public"]["Enums"]["audit_section"]
          unlocked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_unlock_audit_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_day: Database["public"]["Enums"]["gk_day"]
          display_name: string
          id: string
          owns_all_dlc: boolean
        }
        Insert: {
          created_at?: string
          current_day?: Database["public"]["Enums"]["gk_day"]
          display_name?: string
          id?: string
          owns_all_dlc?: boolean
        }
        Update: {
          created_at?: string
          current_day?: Database["public"]["Enums"]["gk_day"]
          display_name?: string
          id?: string
          owns_all_dlc?: boolean
        }
        Relationships: []
      }
      quest_steps: {
        Row: {
          dependencies: Json
          description: string | null
          id: string
          questline_id: string
          required_items: Json
          reward_notes: string | null
          step_number: number
          title: string
          unlocks: string | null
        }
        Insert: {
          dependencies?: Json
          description?: string | null
          id?: string
          questline_id: string
          required_items?: Json
          reward_notes?: string | null
          step_number: number
          title: string
          unlocks?: string | null
        }
        Update: {
          dependencies?: Json
          description?: string | null
          id?: string
          questline_id?: string
          required_items?: Json
          reward_notes?: string | null
          step_number?: number
          title?: string
          unlocks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quest_steps_questline_id_fkey"
            columns: ["questline_id"]
            isOneToOne: false
            referencedRelation: "questlines"
            referencedColumns: ["id"]
          },
        ]
      }
      questlines: {
        Row: {
          dlc: boolean
          id: string
          name: string
          npc_id: string | null
          slug: string
          summary: string | null
        }
        Insert: {
          dlc?: boolean
          id?: string
          name: string
          npc_id?: string | null
          slug: string
          summary?: string | null
        }
        Update: {
          dlc?: boolean
          id?: string
          name?: string
          npc_id?: string | null
          slug?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questlines_npc_id_fkey"
            columns: ["npc_id"]
            isOneToOne: false
            referencedRelation: "npc"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          amount: number
          id: string
          item_id: string
          recipe_id: string
        }
        Insert: {
          amount?: number
          id?: string
          item_id: string
          recipe_id: string
        }
        Update: {
          amount?: number
          id?: string
          item_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          dlc: boolean
          energy_cost: number
          id: string
          name: string
          notes: string | null
          output_amount: number
          output_item_id: string | null
          slug: string
          station_id: string | null
        }
        Insert: {
          dlc?: boolean
          energy_cost?: number
          id?: string
          name: string
          notes?: string | null
          output_amount?: number
          output_item_id?: string | null
          slug: string
          station_id?: string | null
        }
        Update: {
          dlc?: boolean
          energy_cost?: number
          id?: string
          name?: string
          notes?: string | null
          output_amount?: number
          output_item_id?: string | null
          slug?: string
          station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_output_item_id_fkey"
            columns: ["output_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          id: string
          name: string
          notes: string | null
          slug: string
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
          slug: string
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
          slug?: string
        }
        Relationships: []
      }
      task_history: {
        Row: {
          action: string
          created_at: string
          id: string
          new_step: number | null
          old_step: number | null
          profile_id: string
          questline_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_step?: number | null
          old_step?: number | null
          profile_id: string
          questline_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_step?: number | null
          old_step?: number | null
          profile_id?: string
          questline_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_questline_id_fkey"
            columns: ["questline_id"]
            isOneToOne: false
            referencedRelation: "questlines"
            referencedColumns: ["id"]
          },
        ]
      }
      technologies: {
        Row: {
          blue_cost: number
          description: string | null
          dlc: boolean
          gratitude_cost: number
          green_cost: number
          id: string
          name: string
          red_cost: number
          slug: string
          soul_cost: number
          tree_id: string
        }
        Insert: {
          blue_cost?: number
          description?: string | null
          dlc?: boolean
          gratitude_cost?: number
          green_cost?: number
          id?: string
          name: string
          red_cost?: number
          slug: string
          soul_cost?: number
          tree_id: string
        }
        Update: {
          blue_cost?: number
          description?: string | null
          dlc?: boolean
          gratitude_cost?: number
          green_cost?: number
          id?: string
          name?: string
          red_cost?: number
          slug?: string
          soul_cost?: number
          tree_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technologies_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "technology_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      technology_requirements: {
        Row: {
          dlc_required: boolean
          id: string
          note: string | null
          npc_slug: string | null
          prerequisite_technology_id: string | null
          quest_slug: string | null
          technology_id: string
        }
        Insert: {
          dlc_required?: boolean
          id?: string
          note?: string | null
          npc_slug?: string | null
          prerequisite_technology_id?: string | null
          quest_slug?: string | null
          technology_id: string
        }
        Update: {
          dlc_required?: boolean
          id?: string
          note?: string | null
          npc_slug?: string | null
          prerequisite_technology_id?: string | null
          quest_slug?: string | null
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technology_requirements_prerequisite_technology_id_fkey"
            columns: ["prerequisite_technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technology_requirements_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      technology_trees: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      technology_unlocks: {
        Row: {
          id: string
          technology_id: string
          unlocks_label: string | null
          unlocks_recipe_id: string | null
          unlocks_station_id: string | null
        }
        Insert: {
          id?: string
          technology_id: string
          unlocks_label?: string | null
          unlocks_recipe_id?: string | null
          unlocks_station_id?: string | null
        }
        Update: {
          id?: string
          technology_id?: string
          unlocks_label?: string | null
          unlocks_recipe_id?: string | null
          unlocks_station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technology_unlocks_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technology_unlocks_unlocks_recipe_id_fkey"
            columns: ["unlocks_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technology_unlocks_unlocks_station_id_fkey"
            columns: ["unlocks_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quest_progress: {
        Row: {
          completed: boolean
          current_step: number
          id: string
          profile_id: string
          questline_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          current_step?: number
          id?: string
          profile_id: string
          questline_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          current_step?: number
          id?: string
          profile_id?: string
          questline_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quest_progress_questline_id_fkey"
            columns: ["questline_id"]
            isOneToOne: false
            referencedRelation: "questlines"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_prices: {
        Row: {
          buy_price: number | null
          id: string
          item_id: string
          notes: string | null
          sell_price: number | null
          vendor_id: string
        }
        Insert: {
          buy_price?: number | null
          id?: string
          item_id: string
          notes?: string | null
          sell_price?: number | null
          vendor_id: string
        }
        Update: {
          buy_price?: number | null
          id?: string
          item_id?: string
          notes?: string | null
          sell_price?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_prices_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_prices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          day_available: Database["public"]["Enums"]["gk_day"] | null
          dlc: boolean
          id: string
          location: string | null
          name: string
          notes: string | null
          slug: string
        }
        Insert: {
          day_available?: Database["public"]["Enums"]["gk_day"] | null
          dlc?: boolean
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          slug: string
        }
        Update: {
          day_available?: Database["public"]["Enums"]["gk_day"] | null
          dlc?: boolean
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alchemy_component_type: "powder" | "solution" | "extract" | "oil" | "base"
      alchemy_station:
        | "mortar"
        | "alchemy_workbench_i"
        | "alchemy_workbench_ii"
        | "kiln"
        | "still"
      audit_section:
        | "zombies"
        | "tavern"
        | "refugee_camp"
        | "souls_room"
        | "technologies"
        | "recipes"
        | "npc_dialogue"
        | "endings_perks"
        | "vendor_tiers"
      gk_day: "Moon" | "Water" | "Fire" | "Wind" | "Tree" | "Bone"
      tech_point_color: "red" | "green" | "blue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alchemy_component_type: ["powder", "solution", "extract", "oil", "base"],
      alchemy_station: [
        "mortar",
        "alchemy_workbench_i",
        "alchemy_workbench_ii",
        "kiln",
        "still",
      ],
      audit_section: [
        "zombies",
        "tavern",
        "refugee_camp",
        "souls_room",
        "technologies",
        "recipes",
        "npc_dialogue",
        "endings_perks",
        "vendor_tiers",
      ],
      gk_day: ["Moon", "Water", "Fire", "Wind", "Tree", "Bone"],
      tech_point_color: ["red", "green", "blue"],
    },
  },
} as const
